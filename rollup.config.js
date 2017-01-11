import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'views/main.js',
  format: 'cjs',
  plugins: [ 
    babel(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    uglify()
  ],
  dest: './static/bundle.js'
};