# `x`

## Highlights

* **Tiny:** [~500 Bytes](https://github.com/pemrouz/xoox-transform/blob/master/transform.min.js.gz), or [~800 Bytes](https://github.com/pemrouz/xoox/blob/master/xoox.min.js.gz) with basic operators. You can also ergonmoically compose and/or use the operators standalone. 

* **Universal:** Transform from any type to any other type: Array, Object, String, Number, Function, Generators, Async Generators, Observables (see the [test file]() that covers all permutations between these).

* **Fast**: Faster than most.js! There are no intermediate representations created which improves performance all round.

* **Reduced Cognitive Overhead**: No new concepts/types/protocols introduced, and simplification/rationalisation of existing ones into one unifying mental model.

* **Easily Extensible**: It's very easy to write your own operators (you could even inline the one-line [map](https://github.com/pemrouz/xoox-map/blob/master/index.js#L1)/[filter](https://github.com/pemrouz/xoox-filter/blob/master/index.js#L1-L3)!)

## Usage 

```js
import { map, filter, until, transform } from 'xoox'

transform([0,1,2,3,4,5,6,7,8,9])(
  map(v => v )
, filter(v => v % 2)
, until(3)
)
```

`map` and `filter` have their usual meanings. `until`  allows declaratively specifying the stop condition and can take a number (number of items processed), function (predicate), a promise, or a stream (as a stop signal). 

```js
transform(app.on('mousedown'))(
  map(() => app.on('mousemove'))
, flatten
, map(({ x, y }) => console.log('pos:', x, y))
, until(app.once('mouseup'))
)
```

The transform operator takes an _input_, but can also take an _output_ to pipe to (which is what it returns too). This is useful if you want to convert to a different type, or into an existing thing you already have. By default, the output is a new instance of the same type as the input. 

```js
// output is { D: 4, B: 1, C: 3 }
transform({ a: 0, b: 1, c: 3 }, { D: 4 })( 
  map(([k, v]) => [k.toUpperCase(), v]) // uppercase the keys
, filter(([k, v]) => v % 2)             // filter out the entries with even values
)
```

---

# Notes

This is very similar to [callbags](https://github.com/staltz/callbag-basics) (credits @staltz) which provides a single set of operators for both reactive and iterative programming. However, instead of inventing a new protocol (talkbacks), it just uses `Symbol.iterator` and `Symbol.asyncIterator` for iterating through values - hence no listentable/pullable/listener/puller, source/sinks, `from*` functions, etc. The `transform` helper is just a generalisation of `for-of` and `for-await-of` as a function. This has been rewritten from a recursive function to using a while loop to avoid stack overflows when processing large collections. 

## Backpressure

If you are just transforming an array, it will complete as fast as it can (synchronously) and won't needlessly infect your code with Promises. However, if either the input/transform/output is async, it will wait before proceeding. **This means you can also get backpressure** and since the overall result would become async, the ability to `await` the entire transform, e.g: 

```js
await transform(read('numbers.txt'))(
  filter(v => v % 2)
, map(v => v + 1)
, write('even.txt')
)
```

This reads numbers from a file. The `filter` function throws away the even numbers and the transform _immediately_ moves onto the next value (no promises), whilst odd numbers pass through and are written to another file. That chunk is written before moving on to processing the next chunk.

## Operators

The operators themselves are actually just transducers (credits @richhickey). For most users, they can just import and use without worrying about transducers, transformers, reducing functions, etc. But this essentially means you can compose them using any of the usual function composition helpers or pipeline operator. This is what the `transform` function does merely as a convenience, here's how to do it yourself:

```js
const pipeline = compose(
        map(v => v * 3)
      , filter(v => v % 2)
      )

same(
  inputs.array.reduce(pipeline((acc, d) => acc.concat(d)), [])
, [3,9,15,21,27]
)
```

To write your own operator the signature is `(next, iter) => (out, v) => ...`. You can process the value `v` and then call `next` with the `out` and new value to continue with the rest of the pipeline, composing the return value, or just return `out` to not continue further. Any operator can update or even return a new output. You also get access to the iterator `iter`, which is mostly for operators that want to "break" early (i.e. before input or output complete) via `iter.return()`. 

See [map](https://github.com/pemrouz/xoox-map/blob/master/index.js) and [filter](https://github.com/pemrouz/xoox-filter/blob/master/index.js)  (also [flatten](https://github.com/pemrouz/xoox-flatten/blob/master/index.js) and [until](https://github.com/pemrouz/xoox-until/blob/master/index.js)) as examples. Feel free to write your own operators and create PRs to link them from here. 

## `*.prototype.transform` 

Instead of using `transform`, it would also be possible to set the following on prototypes that binds the input and output to make it even easier to use: 

```js
Array.prototype.transform = function(...args){ return transform(this, [])(...args) }

[0,1,2,3,4,5,6,7,8,9]
  .transform(
    map()
  , filter()
  )
```

## Observables

For asynchronous but push-based primitives (like Observables), they would need to create a buffer when creating an async iterator. After experimenting with [changing the implementation in emitterify](https://github.com/utilise/emitterify/blob/master/index.js#L163-L187), I think this seems less bad than it appears. Dropping values as a default is a lot worse. Promises are already queued and do this in fact. In order to cause an overflow, i.e. before the microtask queue can be flushed, you'd have to be generating values in a `while (true)`. Additionaly, it's possible to detect or make this bounded and throw if need be (analagous to a stack overflow).

Regardless of all of that, the `Observable.prototype.transform` or other Obseravable-based code could compose the same operators, avoiding creating an async iterator, and pass the composed pipeline directly to the `.each`  function ([test example](https://github.com/pemrouz/xoox/blob/master/map-fliter-until.test.js#L932-L948)). 

```js
const pipeline = compose(
        map(v => v * 3)
      , filter(v => v % 2)
      )((n, d) => n.next(d))

input
  .each((d, i, n) => pipeline(n,d))
```

## Symbol.reducer/call/receiver?

The main thing from this experiment is that if there is a way to yield values (iteration, sync or async), there needs to be a way to do the opposite operation: take a value and apply it to oneself. 

For Array, if the iterating operation yields the values inside it, the reducing operation is taking values and pushing them to itself. For Object, if it's getting entry pairs (`Object.entries`), the reverse would be taking those pairs and applying them (`Object.fromEntries`). For a number if it's counting up to the value, reducing would be the `+=` operation. For a String, if it's going through the characters, the opposite would be `.concat`'ing new characters to itself. Function would be calling it to generate and return values, and the opposite would be calling it with a value to process. For Generators and Async Generators it would be calling `next` to get values from it, and calling `next` with a value when used as output to process values. For Promises iteration would be getting the resolved value `.then` and when given a value it would resolving itself with that. For Observables it would be subscribing to values and when given values it would emit them to subscribers. By defining a Symbol for this, and allowing types to take control of both their own iterators and reducers, it would enable extending this to simply anything (e.g. ImmutableJS). 

As a bonus, drawing analogy to `> /dev/null`, piping to `null` does nothing (a `noop` could be used too). This would be useful if you didn't want to have any output, although most of the time it can be simply ignored.