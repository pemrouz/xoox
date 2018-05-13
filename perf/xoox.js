const perf = require('utilise/perf')
    , { add, even, sum, input, counter, items, iterations } = require('./common')
    , { pipe, map, filter, reduce, compose } = require('../')
, fn = compose(filter(even), map(add), reduce(0))
for (i of counter) 
  perf(
    () => {

      // counter.map(
      for (j of counter)
        pipe(input, filter(even), map(add), reduce(0))
      // )
    }
  , `most filter-map-reduce ${iterations} iterations ${items} items`)()

// counter.map(
//   perf(() => 
//     counter.map(
//     )
//   , `xoox filter-map-reduce ${iterations} iterations ${items} items`)
// )