#!/usr/bin/env node
import { cancel, confirm, intro, isCancel, log, note, outro, select, spinner, text } from '@clack/prompts';
import spawn from 'cross-spawn';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { getUserAgent } from 'package-manager-detector';

type Agent = 'npm' | 'pnpm' | 'yarn' | 'bun';

interface AgentCommands {
  install: string;
  add: string;
  addArgs: string[];
  run: (script: string) => string;
}

const AGENTS: Record<Agent, AgentCommands> = {
  npm: { install: 'npm install', add: 'npm install', addArgs: ['install'], run: (s) => `npm run ${s}` },
  pnpm: { install: 'pnpm install', add: 'pnpm add', addArgs: ['add'], run: (s) => `pnpm ${s}` },
  yarn: { install: 'yarn', add: 'yarn add', addArgs: ['add'], run: (s) => `yarn ${s}` },
  bun: { install: 'bun install', add: 'bun add', addArgs: ['add'], run: (s) => `bun run ${s}` },
};

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, '../template');

function ensure<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Cancelled.');
    process.exit(0);
  }

  return value as T;
}

export function toValidPackageName(input: string): string {
  const name = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]+/, '')
    .replace(/[^a-z0-9~.-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return name || 'cs-script-project';
}

export function normalizeOutputDir(input: string): string {
  const dir = input.trim().replace(/\\/g, '/').replace(/\/+$/, '');
  return dir || 'build';
}

/** `getUserAgent` can report versioned names such as `yarn@berry`. */
function resolveAgent(name: string | null | undefined): Agent {
  const base = (name ?? '').split('@')[0];
  return base in AGENTS ? (base as Agent) : 'npm';
}

async function isReusableDir(dir: string): Promise<boolean> {
  const entries = await readdir(dir);
  return entries.length === 0 || (entries.length === 1 && entries[0] === '.git');
}

function run(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      reject(error.code === 'ENOENT'
        ? new Error(`${command} was not found on your PATH.`)
        : error);
    });
    child.on('close', (code) => {
      if (code === 0) return resolvePromise();
      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

function printHelp(version: string): void {
  console.log(`
  create-cs-script v${version}

  Scaffold a CS2 TypeScript scripting project.

  Usage
    npm create cs-script [directory] [options]

  Options
    -o, --addon-path <path>   Where compiled scripts are written
        --pm <agent>          Package manager: npm, pnpm, yarn, bun
        --no-install          Skip installing dependencies
    -y, --yes                 Accept defaults, skip prompts
    -h, --help                Show this message
    -v, --version             Show version
`);
}

interface ScaffoldConfig {
  targetDir: string;
  dirName: string;
  outputDir: string;
  agent: Agent;
}

async function scaffold(config: ScaffoldConfig): Promise<string[]> {
  const { targetDir, dirName, outputDir, agent } = config;

  await mkdir(targetDir, { recursive: true });
  await cp(templateDir, targetDir, { recursive: true });
  // npm strips a literal .gitignore from published tarballs, so it ships as _gitignore.
  await rename(join(targetDir, '_gitignore'), join(targetDir, '.gitignore'));

  const packageName = toValidPackageName(dirName);

  const pkgPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.name = packageName;
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const s2zePackages = ['dependencies', 'devDependencies']
    .flatMap((field) => Object.keys(pkg[field] ?? {}))
    .filter((dep) => dep.startsWith('@s2ze/'))
    .sort();

  const rollupPath = join(targetDir, 'rollup.config.js');
  const rollup = await readFile(rollupPath, 'utf8');
  await writeFile(rollupPath, rollup.replace('\'__OUTPUT_DIR__\'', JSON.stringify(outputDir)));

  const commands = AGENTS[agent];
  const updateArgs = s2zePackages.map((name) => `${name}@latest`).join(' ');

  const readmePath = join(targetDir, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  await writeFile(
    readmePath,
    readme
      .replaceAll('__PROJECT_NAME__', packageName)
      .replaceAll('__PM_INSTALL__', commands.install)
      .replaceAll('__PM_START__', commands.run('start'))
      .replaceAll('__PM_UPDATE__', `${commands.add} ${updateArgs}`),
  );

  return s2zePackages;
}

async function install(agent: Agent, targetDir: string, packages: string[]): Promise<boolean> {
  const commands = AGENTS[agent];
  const progress = spinner();
  progress.start(`Installing dependencies with ${agent}`);

  try {
    await run(agent, [...commands.addArgs, ...packages.map((name) => `${name}@latest`)], targetDir);
    progress.stop('Installed dependencies');
    return true;
  } catch (error) {
    progress.stop(`Could not install with ${agent}`);
    log.warn(error instanceof Error ? error.message.split('\n').slice(0, 3).join('\n') : String(error));
    return false;
  }
}

async function main(): Promise<void> {
  const self = JSON.parse(await readFile(resolve(here, '../package.json'), 'utf8'));
  const version = self.version as string;

  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'addon-path': { type: 'string', short: 'o' },
      'pm': { type: 'string' },
      'no-install': { type: 'boolean' },
      'yes': { type: 'boolean', short: 'y' },
      'help': { type: 'boolean', short: 'h' },
      'version': { type: 'boolean', short: 'v' },
    },
  });

  if (values.help) {
    printHelp(version);
    return;
  }

  if (values.version) {
    console.log(version);
    return;
  }

  const skipPrompts = values.yes === true;
  const detected = resolveAgent(values.pm ?? getUserAgent());

  intro(`create-cs-script v${version}`);

  const dirName = positionals[0]
    ?? (skipPrompts
      ? 'my-cs-script'
      : ensure(await text({
          message: 'Project name',
          placeholder: 'my-cs-script',
          defaultValue: 'my-cs-script',
        })));

  const targetDir = resolve(process.cwd(), dirName);

  if (existsSync(targetDir) && !await isReusableDir(targetDir)) {
    const overwrite = skipPrompts
      ? false
      : ensure(await confirm({
          message: `${dirName} is not empty. Delete its contents and continue?`,
          initialValue: false,
        }));

    if (!overwrite) {
      cancel(`${dirName} already exists and is not empty.`);
      process.exit(1);
    }

    await rm(targetDir, { recursive: true, force: true });
  }

  const agent = values.pm || skipPrompts
    ? detected
    : resolveAgent(ensure(await select({
        message: 'Package manager',
        initialValue: detected,
        options: (Object.keys(AGENTS) as Agent[]).map((value) => ({
          value,
          label: value === detected ? `${value} (detected)` : value,
        })),
      })));

  const outputDir = normalizeOutputDir(
    values['addon-path']
    ?? (skipPrompts
      ? 'build'
      : ensure(await text({
          message: 'Where should compiled scripts be written?',
          placeholder: 'build (or an absolute path to your addon folder)',
          defaultValue: 'build',
        }))),
  );

  const s2zePackages = await scaffold({ targetDir, dirName, outputDir, agent });

  const commands = AGENTS[agent];
  const installed = values['no-install'] === true
    ? false
    : await install(agent, targetDir, s2zePackages);

  const cdTarget = dirName.includes(' ') ? `"${dirName}"` : dirName;
  const steps = installed
    ? [`cd ${cdTarget}`, commands.run('start')]
    : [`cd ${cdTarget}`, commands.install, commands.run('start')];

  note(steps.join('\n'), 'Next steps');

  outro(
    outputDir === 'build'
      ? 'Set OUTPUT_DIR in rollup.config.js to your addon folder for in-game hot reload.'
      : `Scripts will be written to ${outputDir}`,
  );
}

main().catch((error: unknown) => {
  cancel(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
