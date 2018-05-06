import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'index.js'
, output: { 
    file: 'xoox.bundle.js' 
  , format: 'iife'
  } 
, name: 'x'
, plugins: [
    nodeResolve({ browser: true })
  , commonjs({ ignoreGlobal: true })
  ]
}