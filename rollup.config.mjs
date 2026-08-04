import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

import pkg from './package.json' with { type: "json" };

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
      terser(),
    ],
  }
];
