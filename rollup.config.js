const common = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const dts = require('rollup-plugin-dts');
const typescript = require('@rollup/plugin-typescript');

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      common.default(),
      resolve.default(),
      typescript({ tsconfig: './tsconfig.prod.json' }),
    ],
    // ADD THIS:
    external: ['mongoose', 'ramda'],
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts.default()],
    external: [/\.(css|less|scss)$/],
  },
];
