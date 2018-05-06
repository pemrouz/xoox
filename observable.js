// this is just a test helper function: wrapper around emitterify
const emitterify = require('utilise/emitterify')
    , noop = function(){}

module.exports = (start = noop) => emitterify().on('foo').on('start', async function(){
  return this.once('stop', await start(this)) 
})