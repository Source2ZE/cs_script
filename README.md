# cs_script

TypeScript libraries and type definitions for scripting in **Counter-Strike 2**.

This repository is a [pnpm](https://pnpm.io/) workspace. Each package is published independently to npm under the `@s2ze` scope but shares a single fixed version across the workspace.

## Packages

| Package | Description |
| --- | --- |
| [`@s2ze/types`](packages/types) | Valve-provided type definitions for CS2 scripting |
| [`@s2ze/math`](packages/math) | Math utilities (vectors, matrices, etc.) for scripts. |
| [`@s2ze/scheduler`](packages/scheduler) | Scheduling helpers, setTimeout, setInterval. |
| [`@s2ze/debug`](packages/debug) | Debugging helpers. |
| [`@s2ze/tsconfig`](packages/tsconfig) | Shared TypeScript configuration consumed by the other packages. |

## Requirements

- **Node.js** (LTS recommended)
- **pnpm** `11.2.2` (the version is pinned via the `packageManager` field — run `corepack enable` to have the correct version selected automatically)

## Getting started

```bash
pnpm install        # install all dependencies and link workspace packages
pnpm build          # compile every package (runs `build` in each package)
pnpm test           # run the test suites
```

Common root scripts (see `package.json`):

| Script | What it does |
| --- | --- |
| `pnpm build` | `pnpm -r run build` — builds every package. |
| `pnpm test` | `pnpm -r run test` — tests every package. |
| `pnpm lint` | Run ESLint across the workspace. |
| `pnpm format` | `eslint . --fix` — autofix lint/formatting. |

## Development workflow

Each package compiles its TypeScript **source** in `src/` down to JavaScript in a `build/` directory:

When one package imports another (e.g. `@s2ze/debug` importing `@s2ze/math`), pnpm symlinks the dependency into `node_modules`, but Node/TypeScript resolve the import through that package's `main`/`exports` fields — which point at **`build/`, not `src/`**, editing `packages/math/src/...` does *not* change what `@s2ze/debug` sees until `@s2ze/math` is rebuilt and its `build/` output is regenerated. The consumer reads the compiled artifact, so stale `build/` output means stale behavior.

After changing a library package, you need to rebuild it for the changes to be reflected with `pnpm build` in the root.

## License

[MIT](LICENSE) © Source2ZE
