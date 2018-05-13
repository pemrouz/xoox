var x = (function () {
  'use strict';

  // this is just a helper function: standard compose from any library
  var compose = (...fns) => (next, ...args) => fns
    .reverse()
    .reduce((res, fn) => fn(res, ...args), next);

  var xooxPipe = (inp, ...fns) => {
    const itr = stop((inp[Symbol.asyncIterator] || inp[Symbol.iterator] || from(inp)).call(inp));
    return step(
      itr
    , compose(...fns)((value => itr.out = value), itr)
    )
  };

  const step = (
    itr
  , pipeline
  , rec = itr.next()
  ) => {
    if (rec.then) return rec.then(rec => step(itr, pipeline, rec))
    while (!rec.done && !itr.done) {
      const out = pipeline(rec.value);
      if (out && out.then && !out.next) return out.then(out => step(itr, pipeline))
      rec = itr.next();
      if (rec.then) return rec.then(rec => step(itr, pipeline, rec))
    }
    return itr.out
  };

  // TODO: add stops method, as itr.return doesn't set done (which it probably should)?
  const stop = itr => {
    itr.stopped = new Promise(resolve => {
      itr.stop = () => !itr.done && (itr.done = true) && itr.return && resolve(itr.return());
    });
    return itr
  };

  const from = thing => 
    thing.constructor == Object   ? function*(){ for (entry of Object.entries(this)) yield entry; }
  : thing.constructor == Function ? function*(){ while (true) yield this(); }
  : thing.constructor == Number   ? function*(value = 0){ while (value++ < this) yield value; }
                                  : 0;

  var xooxMap = fn => next => v => next(fn(v));

  var xooxUntil = fn => (next, t) =>
    fn && fn.then ? (fn.then(t.stop), next)
  : fn && fn.each ? (fn.each(t.stop), next)
  : v => 
      typeof fn == 'number'   ? ((--fn <= 0 && t.stop()), (fn >= 0 && next(v)))
    : typeof fn == 'function' ? (fn(v) ? (t.stop()) : next(v)) 
                              : 0;

  var xooxReduce = (acc, seed) => next => v => 
    acc != null && next(                    // /dev/null
      acc.next    ? (acc.next(v))           // Generators, Channels, Observables
    : acc.call    ? (seed = acc(seed, v))   // Functions
    : acc.push    ? (acc.push(v), acc)      // Array
    : acc.concat  ? (acc = acc.concat(v))   // Strings
    : acc.toFixed ? (acc += v)              // Number
                  : (acc[v[0]] = v[1], acc) // Object
    );

  var xooxFilter = fn => next => v => fn(v) && next(v);

  var xooxFlatten = (next, outer) => v => {
    xooxPipe(v, xooxUntil(outer.stopped), () => d => next(d));
  };

  var xoox = x = xooxPipe; 
  x.pipe = x.x = x;
  x.compose = compose;
  x.map = xooxMap;
  x.until = xooxUntil;
  x.reduce = xooxReduce;
  x.filter = xooxFilter;
  x.flatten = xooxFlatten;

  return xoox;

}());
