// This file tests transforms between all the possible permutations 
// of Array, Object, Function, Generator, AsyncGenerator and Observable as the input and output
// There also tests showing how to compose the operators and use them without the transform helper function
const { test } = require('tap')
    , { map, filter, transform, until, compose } = require('./')
    , observable = require('./observable')
    , prime = (gen, g = gen()) => (g.next(), g) // annoying prime for output generators
    , inputs = {
        array: [0,1,2,3,4,5,6,7,8,9]
      , string: '0123456789'
      , object: {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9}
      , gen: function*(){ for (value of inputs.array) yield value }
      , agen: async function*(){ for (value of inputs.array) yield await value }
      , stream: () => observable(async chan => {
          for (value of inputs.array)
            await Promise.all(chan.next(value))
          chan.stop()
        })
      , function: (i = 0) => () => i++
      }

// array test
test('array -> array', ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.array)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('array -> array [existing]', ({ same, plan }) => {
  plan(1)
  
  same(
    transform(inputs.array, ['foo'])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , ['foo', 3, 9, 15]
  )
})

test('array -> object', ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.array, {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map(v => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('array -> string', ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.array, '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('array -> number', ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.array, 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('array -> function', ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.array, d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('array -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.array, prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('array -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.array, prime(async function*(value){ while (true) { results.push(yield await value) }}))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('array -> stream', async ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(inputs.array, out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

// object
test('object -> array', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.object, [])(
      map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , until(3)
    , map(([k,v]) => v)
    )
  , [3,9,15]
  )
})

test('object -> object', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.object)(
      map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , until(3)
    )
  , { b:3, d:9, f:15 }
  )
})

test('object -> string', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.object, '')(
      map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , map(([k,v]) => v)
    , until(3)
    )
  , '3915'
  )
})

test('object -> number', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.object, 0)(
      map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , map(([k,v]) => v)
    , until(3)
    )
  , 27
  )
})

test('object -> function', ({ plan, same }) => {
  plan(1)
  const results = []

  transform(inputs.object, d => results.push(d))(
    map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(3)
  )

  same(results, [['b',3],['d',9],['f',15]])
})

test('object -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.object, prime(function*(value){ while (true) results.push(yield value) }))(
    map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(3)
  )

  same(results, [['b',3],['d',9],['f',15]])
})

test('object -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.object, prime(async function*(value){ while (true) { results.push(yield await value) }}))(
    map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(3)
  )

  same(results, [['b',3],['d',9],['f',15]])
})

test('object -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(inputs.object, out)(
    map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(3)
  )

  same(results, [['b',3],['d',9],['f',15]])
})

// string
test('string -> array', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.string, [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('string -> object', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.string, {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map((v) => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('string -> string', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.string)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('string -> number', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.string, 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('string -> function', ({ plan, same }) => {
  plan(1)
  const results = []

  transform(inputs.string, d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('string -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.string, prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('string -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.string, prime(async function*(value){ while (true) { results.push(yield await value) }}))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('string -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(inputs.string, out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

// number
test('number -> array', ({ plan, same }) => {
  plan(1)
  same(
    transform(9, [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('number -> object', ({ plan, same }) => {
  plan(1)
  same(
    transform(9, {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map((v) => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('number -> string', ({ plan, same }) => {
  plan(1)
  same(
    transform(9, '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('number -> number', ({ plan, same }) => {
  plan(1)
  same(
    transform(9)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('number -> function', ({ plan, same }) => {
  plan(1)
  const results = []

  transform(9, d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('number -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(9, prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('number -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(9, prime(async function*(value){ while (true) { results.push(yield await value) }}))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('number -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(9, out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

// function
test('function -> array', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.function(), [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('function -> object', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.function(), {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map((v) => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('function -> string', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.function(), '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('function -> number', ({ plan, same }) => {
  plan(1)
  same(
    transform(inputs.function(), 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('function -> function', ({ plan, same }) => {
  plan(1)
  const results = []

  transform(inputs.function(), d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('function -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.function(), prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('function -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.function(), prime(async function*(value){ while (true) { results.push(yield await value) }}))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('function -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(inputs.function(), out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

// generator
test('generator -> array', async ({ same, plan }) => {
  same(
    transform(inputs.gen(), [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('generator -> object', async ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.gen(), {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map(v => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('generator -> string', async ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.gen(), '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('generator -> number', async ({ same, plan }) => {
  plan(1)
  same(
    transform(inputs.gen(), 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('generator -> function', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.gen(), d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('generator -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  transform(inputs.gen(), prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('generator -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.gen(), prime(async function*(value){ while (true) results.push(yield await value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('generator -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  transform(inputs.gen(), out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

// async generator
test('async generator -> array', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.agen(), [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('async generator -> object', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.agen(), {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map(v => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('async generator -> string', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.agen(), '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('async generator -> number', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.agen(), 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('async generator -> function', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.agen(), d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('async generator -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.agen(), prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('async generator -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.agen(), prime(async function*(value){ while (true) results.push(yield await value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('async generator -> stream', async ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  await transform(inputs.agen(), out)(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )

  same(results, [3,9,15])
})

test('stream -> array', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.stream(), [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )
})

test('stream -> object', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.stream(), {})(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    , map(v => [v,v])
    )
  , { 3:3, 9:9, 15:15 }
  )
})

test('stream -> string', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.stream(), '')(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , '3915'
  )
})

test('stream -> number', async ({ same, plan }) => {
  plan(1)
  same(
    await transform(inputs.stream(), 0)(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , 27
  )
})

test('stream -> function', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.stream(), d => results.push(d))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )
  
  same(results, [3,9,15])
})

test('stream -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.stream(), prime(function*(value){ while (true) results.push(yield value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )
  
  same(results, [3,9,15])
})

test('stream -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await transform(inputs.stream(), prime(async function*(value){ while (true) results.push(yield await value) }))(
    map(v => v * 3)
  , filter(v => v % 2)
  , until(3)
  )
  
  same(results, [3,9,15])
})

// extra checks
test('stream -> stream (unwrap first value)', async ({ same, plan }) => {
  plan(2)
  const input = inputs.stream()

  same(
    await transform(input)(
      map(v => v * 3)
    , filter(v => v % 2)
    , filter(v => v > 20)
    )
  , 21
  )

  same(input.li.length, 0)
})

test('stream -> array (early break)', async ({ same, plan }) => {
  plan(3)
  const unsubscribed = []
      , chan = observable(async chan => {
          await Promise.all(inputs.array.map(async value => chan.next(await value)))
          return () => unsubscribed.push('yes')
        })

  same(
    await transform(chan, [])(
      map(v => v * 3)
    , filter(v => v % 2)
    , until(3)
    )
  , [3,9,15]
  )

  same(chan.li.length, 0)
  same(unsubscribed, ['yes'])
})


test('stream -> stream (wait via producer)', async ({ same, plan }) => {
  plan(1)
  const inp = observable()
      , out = observable()
      , results = []

  transform(inp, out)(
    map(v => v * 3)
  , filter(v => v % 2)
  )

  out.each(d => results.push(d))
  await Promise.all(inputs.array.map(d => Promise.all(inp.next(d))))
  same(results, [3,9,15,21,27])
})

test('stream -> stream (wait via transform)', async ({ same, plan }) => {
  plan(2)
  const inp = observable()
      , out = observable()
      , results = []
      , done = transform(inp, out)(
          map(v => v * 3)
        , filter(v => v % 2)
        )

  out.each(d => results.push(d))
  inputs.array.map(d => inp.next(d))
  inp.stop()
  await done
  same(results, [3,9,15,21,27])
  same(inp.li.length, 0)
})

test('stream - without async iterator', async ({ same, plan }) => {
  plan(1)
  const input = observable()
      , results = []
      , next = (n, d) => n.next(d)
      , pipeline = compose(
          map(v => v * 3)
        , filter(v => v % 2)
        )(next)

  input
    .each((d, i, n) => pipeline(n,d))
    .each(d => results.push(d))

  inputs.array.map(d => input.next(d))
  same(results, [3,9,15,21,27])
})

test('without helper functions (array.reduce)', async ({ same, plan }) => {
  plan(1)
  const pipeline = compose(
          map(v => v * 3)
        , filter(v => v % 2)
        )

  same(
    inputs.array.reduce(pipeline((acc, d) => acc.concat(d)), [])
  , [3,9,15,21,27]
  )
})