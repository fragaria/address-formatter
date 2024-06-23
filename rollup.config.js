import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'addressFormatter',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      exports: 'default'
    },
    plugins: [
      json(),
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**']
      }),
      terser(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'es', exports: 'default' },
    ],
    plugins: [
      json(),
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**']
      }),
    ],
  },
];
