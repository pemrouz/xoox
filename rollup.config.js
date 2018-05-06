import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'index.js'
, output: { 
    file: 'xoox.bundle.js' 
  , name: 'x'
  , format: 'iife'
  } 
, plugins: [
    nodeResolve({ browser: true })
  , commonjs({ ignoreGlobal: true })
  ]
}