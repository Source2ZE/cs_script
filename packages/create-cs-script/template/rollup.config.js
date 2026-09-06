import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/**
 * Where the compiled scripts are written.
 *
 * Point this at your CS2 addon's content folder to have `npm start` write
 * straight into the addon, which hot-reloads the script in-game on save. For
 * example:
 *
 *   'C:/.../Counter-Strike Global Offensive/content/csgo_addons/my_addon/scripts'
 */
const OUTPUT_DIR = '__OUTPUT_DIR__';

const targets = [
  {
    input: 'src/test1/index.ts',
    tsconfig: 'src/test1/tsconfig.json',
    output: `${OUTPUT_DIR}/test1.js`,
  },
];

export default targets.map(({ input, output, tsconfig }) => ({
  input,
  output: {
    file: output,
    format: 'esm',
  },
  external: ['cs_script/point_script'],
  plugins: [
    typescript({ tsconfig, outDir: OUTPUT_DIR }),
    nodeResolve(),
    commonjs(),
  ],
}));
