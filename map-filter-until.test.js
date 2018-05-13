// This file tests transforms between all the possible permutations 
// of Array, Object, Function, Generator, AsyncGenerator and Observable as the input and output
// There also tests showing how to compose the operators and use them without the transform helper function
const { test } = require('tap')
    , { map, filter, reduce, pipe, until, compose } = require('./')
    , observable = require('./observable')
    , prime = (gen, g = gen()) => (g.next(), g) // annoying prime for output generators
    , inputs = {
        array: [0,1,2,3,4,5,6,7,8,9]
      , string: '0123456789'
      , object: {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9}
      , gen: function*(){ for (value of inputs.array) yield value }
      , agen: async function*(){ for (value of inputs.array) yield await value }
      , stream: () => observable(async chan => {
          let i = 0
          while (!chan.done && i++ <= inputs.array.length)
            await Promise.all(chan.next(inputs.array[i-1]))
          chan.stop()
        })
      , function: (i = 0) => () => i++
      }

// array test
test('array -> array', ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('array -> array [existing]', ({ same, plan }) => {
  plan(1)
  
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(['foo'])
    )
  , ['foo', 3, 9, 15, 21]
  )
})

test('array -> object', ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map(v => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('array -> string', ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('array -> number', ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('array -> function', ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.array
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )

})

test('array -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    inputs.array
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('array -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.array
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) results.push(yield await value) }))
  )

  same(results, [3,9,15,21])
})

test('array -> stream', async ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    inputs.array
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

// object
test('object -> array', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.object
    , map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , until(4)
    , map(([k,v]) => v)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('object -> object', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.object
    , map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , until(4)
    , reduce({})
    )
  , { b:3, d:9, f:15, h:21 })
})

test('object -> string', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.object
    , map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , map(([k,v]) => v)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('object -> number', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.object
    , map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , map(([k,v]) => v)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('object -> function', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.object
    , map(([k,v]) => [k,v*3])
    , filter(([k,v]) => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [['b',3],['d',9],['f',15],['h',21]]
  )
})

test('object -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    inputs.object
  , map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [['b',3],['d',9],['f',15],['h',21]])
})

test('object -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.object
  , map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) { results.push(yield await value) }}))
  )

  same(results, [['b',3],['d',9],['f',15],['h',21]])
})

test('object -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    inputs.object
  , map(([k,v]) => [k,v*3])
  , filter(([k,v]) => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [['b',3],['d',9],['f',15],['h',21]])
})

// string
test('string -> array', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.string
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('string -> object', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.string
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map((v) => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('string -> string', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.string
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('string -> number', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.string
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('string -> function', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.string
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('string -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    inputs.string
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('string -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.string
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) { results.push(yield await value) }}))
  )

  same(results, [3,9,15,21])
})

test('string -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    inputs.string
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

// number
test('number -> array', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      9
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('number -> object', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      9
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map((v) => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('number -> string', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      9
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('number -> number', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      9
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('number -> function', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      9
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('number -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    9
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('number -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    9
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) { results.push(yield await value) }}))
  )

  same(results, [3,9,15,21])
})

test('number -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    9
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

// function
test('function -> array', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.function()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('function -> object', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.function()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map((v) => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('function -> string', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.function()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('function -> number', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.function()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('function -> function', ({ plan, same }) => {
  plan(1)
  same(
    pipe(
      inputs.function()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('function -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    inputs.function()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('function -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.function()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) { results.push(yield await value) }}))
  )

  same(results, [3,9,15,21])
})

test('function -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    inputs.function()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

// generator
test('generator -> array', async ({ same, plan }) => {
  same(
    pipe(
      inputs.gen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('generator -> object', async ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.gen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map(v => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('generator -> string', async ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.gen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('generator -> number', async ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.gen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('generator -> function', async ({ same, plan }) => {
  plan(1)
  same(
    pipe(
      inputs.gen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('generator -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  pipe(
    inputs.gen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('generator -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.gen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) results.push(yield await value) }))
  )

  same(results, [3,9,15,21])
})

test('generator -> stream', ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  pipe(
    inputs.gen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

// async generator
test('async generator -> array', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.agen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , reduce([])
    , until(4)
    )
  , [3,9,15,21]
  )
})

test('async generator -> object', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.agen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map(v => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('async generator -> string', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.agen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('async generator -> number', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.agen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('async generator -> function', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.agen()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('async generator -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.agen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )

  same(results, [3,9,15,21])
})

test('async generator -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.agen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) results.push(yield await value) }))
  )

  same(results, [3,9,15,21])
})

test('async generator -> stream', async ({ same, plan }) => {
  plan(1)
  const out = observable()
      , results = []

  out.each(d => results.push(d))

  await pipe(
    inputs.agen()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(out)
  )

  same(results, [3,9,15,21])
})

test('stream -> array', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.stream()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )
})

test('stream -> object', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.stream()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , map(v => [v,v])
    , reduce({})
    )
  , { 3:3, 9:9, 15:15, 21:21 }
  )
})

test('stream -> string', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.stream()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce('')
    )
  , '391521'
  )
})

test('stream -> number', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.stream()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce(0)
    )
  , 48
  )
})

test('stream -> function', async ({ same, plan }) => {
  plan(1)
  same(
    await pipe(
      inputs.stream()
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce((acc, v) => (acc.push(v), acc), [])
    )
  , [3,9,15,21]
  )
})

test('stream -> generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.stream()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(function*(value){ while (true) results.push(yield value) }))
  )
  
  same(results, [3,9,15,21])
})

test('stream -> async generator', async ({ same, plan }) => {
  plan(1)
  const results = []

  await pipe(
    inputs.stream()
  , map(v => v * 3)
  , filter(v => v % 2)
  , until(4)
  , reduce(prime(async function*(value){ while (true) results.push(yield await value) }))
  )
  
  same(results, [3,9,15,21])
})

// extra checks
test('stream -> stream (unwrap first value)', async ({ same, plan }) => {
  plan(2)
  const input = inputs.stream()

  same(
    await pipe(
      input
    , map(v => v * 3)
    , filter(v => v % 2)
    )
  , 27
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
    await pipe(
      chan
    , map(v => v * 3)
    , filter(v => v % 2)
    , until(4)
    , reduce([])
    )
  , [3,9,15,21]
  )

  same(chan.li.length, 0)
  same(unsubscribed, ['yes'])
})

test('stream -> stream (wait via producer)', async ({ same, plan }) => {
  plan(1)
  const inp = observable()
      , out = observable()
      , results = []

  pipe(
    inp
  , map(v => v * 3)
  , filter(v => v % 2)
  , reduce(out)
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
      , done = pipe(
          inp
        , map(v => v * 3)
        , filter(v => v % 2)
        , reduce(out)
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
      , pipeline = compose(
          map(v => v * 3)
        , filter(v => v % 2)
        )

  input
    .each((d, i, n) => pipeline(n.next)(d))
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
    inputs.array.reduce((acc, v) => (pipeline(v => acc.push(v))(v), acc), [])
  , [3,9,15,21,27]
  )
})

test('piping to null', async ({ same, plan }) => {
  plan(2)
  const results = []

  same(
    pipe(
      inputs.array
    , map(d => results.push(d))
    , reduce(null)
    )
  , null
  )

  same(results, inputs.array)
})