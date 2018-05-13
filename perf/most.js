const perf = require('utilise/perf')
    , { add, even, sum, input, counter, items, iterations } = require('./common')
    , { from } = require('most')

;(async () => {
  for (i of counter) 
    await perf(
      async () => (
        await Promise.all(
          counter.map(
           () => from(input).filter(even).map(add).reduce(sum, 0)
          )
        )
      )
    , `most filter-map-reduce ${iterations} iterations ${items} items`)()
})()