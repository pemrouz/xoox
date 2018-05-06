var x = (function () {
  'use strict';

  // this is just a helper function: standard compose from any library
  var compose = (...fns) => (next, ...args) => 
    fns.reverse().reduce((res, fn) => fn(res, ...args), next);

  var xooxTransform = (
    inp
  , out = (inp[Symbol.species] || inp.constructor)()
  , itr = stop((inp[Symbol.asyncIterator] || inp[Symbol.iterator]).call(inp))
  ) => (...fns) => step(
      compose(...fns)(next, itr)
    , out
    , itr
    );

  const step = (
    pipeline
  , out
  , itr
  , rec = itr.next()
  ) => {
    if (rec.then) return rec.then(rec => step(pipeline, out, itr, rec))
    while (!rec.done) {
      out = pipeline(out, rec.value);
      if (itr.done) return out
      if (out && out.then && !out.next) return out.then(out => step(pipeline, out, itr))
      rec = itr.next();
      if (rec.then) return rec.then(rec => step(pipeline, out, itr, rec))
    }
    return out
  };

  // TODO: default receivers which could be set
  // standardise this as Symbol.send/receive/call/reduce?
  const next = (out, v) => 
    out == null ? out
  : out.next    ? (then(out.next(v), () => out)) // Generators, Channels, Observables
  : out.call    ? (out(v), out)                  // Functions
  : out.push    ? (out.push(v), out)             // Array
  : out.concat  ? (out.concat(v))                // Strings
  : out.toFixed ? (out += v)                     // Number
                : (out[v[0]] = v[1], out);        // Object

  const then = (thing, proc) => 
    thing.next || !thing.then ? proc(thing) : thing.then(proc); 

  // TODO: add stops method, as itr.return doesn't set done (which it probably should)?
  const stop = itr => {
    itr.stopped = new Promise(resolve => {
      itr.stop = () => !itr.done && (itr.done = true) && itr.return && resolve(itr.return());
    });
    return itr
  };

  // TODO: These can be set by default instead of passing in 
  // to make object-to-object transformations for example "just work"
  Object.prototype[Symbol.iterator] = function*(){ 
    for (entry of Object.entries(this)) yield entry; 
  };

  Function.prototype[Symbol.iterator] = function(){ 
    return { 
      next: () => ({ value: this(), done: false })
    }
  };

  Number.prototype[Symbol.iterator] = function*(value = 0){
    while (value++ < this) yield value;
  };

  var xooxMap = fn => next => (acc, v) => next(acc, fn(v));

  var xooxUntil = fn => (next, t) =>
    fn && fn.then ? (fn.then(t.stop), next)
  : fn && fn.each ? (fn.each(t.stop), next)
  : (acc, v) => 
      typeof fn == 'number'   ? ((--fn <= 0 && t.stop()), (fn >= 0 ? next(acc,v) : acc))
    : typeof fn == 'function' ? (fn(v) ? (t.stop(), acc) : next(acc,v)) 
                              : 0;

  var xooxFilter = fn => next => (acc, v) => fn(v) 
    ? next(acc, v)
    : acc;

  // this is just a helper function: standard compose from any library
  var compose$1 = (...fns) => (next, ...args) => 
    fns.reverse().reduce((res, fn) => fn(res, ...args), next);

  var xooxTransform$1 = (
    inp
  , out = (inp[Symbol.species] || inp.constructor)()
  , itr = stop$1((inp[Symbol.asyncIterator] || inp[Symbol.iterator]).call(inp))
  ) => (...fns) => step$1(
      compose$1(...fns)(next$1, itr)
    , out
    , itr
    );

  const step$1 = (
    pipeline
  , out
  , itr
  , rec = itr.next()
  ) => {
    if (rec.then) return rec.then(rec => step$1(pipeline, out, itr, rec))
    while (!rec.done) {
      out = pipeline(out, rec.value);
      if (itr.done) return out
      if (out && out.then && !out.next) return out.then(out => step$1(pipeline, out, itr))
      rec = itr.next();
      if (rec.then) return rec.then(rec => step$1(pipeline, out, itr, rec))
    }
    return out
  };

  // TODO: default receivers which could be set
  // standardise this as Symbol.send/receive/call/reduce?
  const next$1 = (out, v) => 
    out == null ? out
  : out.next    ? (then$1(out.next(v), () => out)) // Generators, Channels, Observables
  : out.call    ? (out(v), out)                  // Functions
  : out.push    ? (out.push(v), out)             // Array
  : out.concat  ? (out.concat(v))                // Strings
  : out.toFixed ? (out += v)                     // Number
                : (out[v[0]] = v[1], out);        // Object

  const then$1 = (thing, proc) => 
    thing && thing.then && !thing.next ? thing.then(proc) : proc(thing);

  // TODO: add stops method, as itr.return doesn't set done (which it probably should)?
  const stop$1 = itr => {
    itr.stopped = new Promise(resolve => {
      itr.stop = () => !itr.done && (itr.done = true) && itr.return && resolve(itr.return());
    });
    return itr
  };

  // TODO: These can be set by default instead of passing in 
  // to make object-to-object transformations for example "just work"
  Object.prototype[Symbol.iterator] = function*(){ 
    for (entry of Object.entries(this)) yield entry; 
  };

  Function.prototype[Symbol.iterator] = function*(){ 
    while (true) yield this();
  };

  Number.prototype[Symbol.iterator] = function*(value = 0){
    while (value++ < this) yield value;
  };

  // suprise: the transform function is also the flatten operator!
  var xooxFlatten = (next, t) => (acc, v) => (
    xooxTransform$1(v, d => next(acc, d))(xooxUntil(t.stopped)), acc
  );

  var xoox = x = xooxTransform; 
  x.transform = x.x = x;
  x.compose = compose;
  x.map = xooxMap;
  x.until = xooxUntil;
  x.filter = xooxFilter;
  x.flatten = xooxFlatten;

  return xoox;

}());
