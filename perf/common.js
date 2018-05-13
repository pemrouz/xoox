require('colors')
const { items = 100000, iterations = 10 } = require('minimist')(process.argv)

module.exports = {
  add: x => x + 1
, even: x => x % 2 === 0
, sum: (x, y) => x + y
, input: Array(items).fill().map((d, i) => i)
, counter: Array(iterations).fill().map((d, i) => i)  
, iterations
, items
}
