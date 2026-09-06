# create-cs-script

Scaffold a [CS2 TypeScript scripting](https://github.com/Source2ZE/cs_script) project.

## Usage

```sh
npm create cs-script
# or
pnpm create cs-script
yarn create cs-script
bun create cs-script
```

Dependencies are installed for you, pulling the newest `@s2ze` releases. You
will be asked for a project name, a package manager (the one you invoked
this with is preselected), and where compiled scripts should be written.

## Options

Pass a directory as the first argument, and any of these to skip the matching
prompt:

| Option | Description |
| --- | --- |
| `-o`, `--addon-path <path>` | Where compiled scripts are written |
| `--pm <agent>` | Package manager: `npm`, `pnpm`, `yarn`, `bun` |
| `--no-install` | Skip installing dependencies |
| `-y`, `--yes` | Accept defaults, skip prompts |
| `-h`, `--help` | Show usage |
| `-v`, `--version` | Show version |

```sh
npm create cs-script my-map -- --addon-path "D:/csgo_addons/my_map/scripts" --yes
```

## License

MIT
