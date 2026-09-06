# __PROJECT_NAME__

A CS2 TypeScript project, scaffolded with [`create-cs-script`](https://github.com/Source2ZE/cs_script).

## Getting started

```sh
__PM_INSTALL__     # install dependencies
__PM_START__       # build and watch for changes
```

Each entry in `rollup.config.js` compiles to its own `.js` file — one per
`point_script` entity in your map. The project starts with a single script,
`src/test1/`, which builds to `test1.js`.

## Output location

Compiled scripts are written to the `OUTPUT_DIR` set at the top of
`rollup.config.js`. Point it at your addon's content folder and the game will
hot-reload the script whenever you save.

## Adding a script

1. Create `src/my_script/index.ts` and a `tsconfig.json` next to it containing
   `{ "extends": "@s2ze/tsconfig" }`.
2. Add an entry to `targets` in `rollup.config.js`.
3. Point a `point_script` entity's script field at the compiled output.

## Updating the s2ze packages

```sh
__PM_UPDATE__
```

## Docs

- [cs_script packages](https://github.com/Source2ZE/cs_script)
- Engine API type definitions live in `@s2ze/types`.
