const perf = require('utilise/perf')
    , { add, even, sum, input, counter, items, iterations } = require('./common')
    , { map, filter, reduce } = require('rxjs/operators')
    , { from } = require('rxjs')

;(async () => {
  for (i of counter) 
    await perf(
      async () => (
        await Promise.all(
          counter.map(
            () => new Promise(resolve => from(input).pipe(filter(even), map(add), reduce(sum, 0)).subscribe(resolve))
          )
        )
      )
    , `most filter-map-reduce ${iterations} iterations ${items} items`)()
})()