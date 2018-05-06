var x = (function (exports,xoox) {
	'use strict';

	xoox = xoox && xoox.hasOwnProperty('default') ? xoox['default'] : xoox;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

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
	    if (out.then && !out.next) return out.then(out => step(pipeline, out, itr))
	    rec = itr.next();
	    if (rec.then) return rec.then(rec => step(pipeline, out, itr, rec))
	  }
	  return out
	};

	// TODO: default receivers which could be set
	// standardise this as Symbol.send/receive/call/reduce?
	const next = (out, v) => 
	  out.next    ? (then(out.next(v), () => out)) // Generators, Channels, Observables
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

	var xooxUntil$1 = fn => (next, t) =>
	  fn && fn.then ? (fn.then(t.stop), next)
	: fn && fn.each ? (fn.each(t.stop), next)
	: (acc, v) => 
	    typeof fn == 'number'   ? ((--fn <= 0 && t.stop()), (fn >= 0 ? next(acc,v) : acc))
	  : typeof fn == 'function' ? (fn(v) ? (t.stop(), acc) : next(acc,v)) 
	                            : 0;

	// suprise: the transform function is also the flatten operator!
	var flatten = (next, t) => (acc, v) => (
	  xoox(v, d => next(acc, d))(xooxUntil$1(t.stopped)), acc
	);

	var xoox$1 = createCommonjsModule(function (module) {
	module.exports = xooxTransform;
	module.exports.x = module.exports.transform = module.exports;
	module.exports.compose = compose;
	module.exports.map = xooxMap;
	module.exports.until = xooxUntil;
	module.exports.filter = xooxFilter;
	module.exports.flatten = flatten;
	});
	var xoox_1 = xoox$1.x;
	var xoox_2 = xoox$1.transform;
	var xoox_3 = xoox$1.compose;
	var xoox_4 = xoox$1.map;
	var xoox_5 = xoox$1.until;
	var xoox_6 = xoox$1.filter;
	var xoox_7 = xoox$1.flatten;

	exports.default = xoox$1;
	exports.x = xoox_1;
	exports.transform = xoox_2;
	exports.compose = xoox_3;
	exports.map = xoox_4;
	exports.until = xoox_5;
	exports.filter = xoox_6;
	exports.flatten = xoox_7;

	return exports;

}({},xoox));
