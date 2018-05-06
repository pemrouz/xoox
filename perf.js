require('colors')
const perf = require('utilise/perf')
    , { x, map, filter } = require('./')
    , most = require('most')
    , { items = 100000, iterations = 10 } = require('minimist')(process.argv)
    , add = x => x + 1
    , even = x => x % 2 === 0
    , sum = (x, y) => x + y
    , input = Array(items).fill().map((d, i) => i)
    , counter = Array(iterations).fill().map((d, i) => i)

perf(() => (
  Promise.all(
    counter.map(
      () => most.from(input).filter(even).map(add).reduce(sum, 0)
    )
  )
), `most filter-map-reduce ${iterations} iterations ${items} items`)()

perf(() => (
  counter.map(
    () => x(input, 0)(filter(even), map(add))
  )
), `xoox filter-map-reduce ${iterations} iterations ${items} items`)()