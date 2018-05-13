const { test } = require('tap')
    , emitter = require('utlise/emitterify')
    , compose = require('xoox-transform/compose')
    
const y = inp => (...args) => {
  const out = emitter()
      , pipeline = compose(...args)(out.next)

  return stream(inp)
    .on('change')
    .each(...args)
    // .each((change, i, n) =>
    //   pipeline(out, change)
    // )

  return out
}

// ----
const def   = body => name => Object.defineProperty(body, name, { value: Emitter.prototype[name].bind(body) })
    , ns    = Symbol('namespaces')
    , li    = Symbol('listeners')
    , ch    = Symbol('channels')
    , res   = Symbol('resolve')
    , rej   = Symbol('reject')
    , hooks = Symbol('hooks')
    , init  = body => {
        body[sub] = Object.create(null)
        body[ns] = Object.create(null)
        body[li] = []
      }
    // , { assign } = Object
    , get = (body, type, [id, ns] = type.split('.')) =>
        this.on[ch][id] = this.on.[ch][id] || new Emitter()

    , push = (body, fn, opts = {}){
        const rec = body[hooks].on({ fn, ...opts })
        body[li].push(rec)
        if (opts.ns) body[ns][opts.ns] = rec
      }

class Emitter extends Promise {
  static augment(body, hooks){
    keys(Emitter.prototype).map(def(body))
    Emitter.init(body)
    return body
  }

  constructor(body, hooks){
    if (body) return Emitter.augment(body, hooks)

    super((resolve, reject) => {
      this[res] = resolve
      this[rej] = reject
    })

    Emitter.init(this)
  }

  on(a, b, c){
    return is.str(a) &&  is.fn(b) ? (push(get(a), b, c), this) # ('foo', fn), ('foo', fn, {})
         : is.str(a) && !is.fn(b) ? (get(a))                   # ('foo'), ~('foo', {})
                                  : this
  }

  off(){
    
  }

  once(type, fn, opts){
    return this.on(type, fn, { once: true, ...opts })
  }

  next(type, args){

  }

  each(...args){
    const out = new Emitter()
    this._add(compose(...args)(out.next))
    return out
  }

}

a = new Emitter()

a.next
a.each


.on(function(){ })
.on('foo')
.on('foo.ns')
.on('foo', function(){})
.on('foo.ns', function(){})

.once()

const stream = input => emitter()
  .
  .on('start', function(){
    this.next({ type: 'update', value: input })

    input
      .on('change')
      .each(this.next)
      .until(this.once('stop'))

    this
      .once('stop')
      .filter()

  })

module.exports = fn => next => (acc, v) => fn(v) 
  ? next(acc, v)
  : acc

const filter = predicate => next => (output, v) => {
  fn(v) 
    ? next(output, v)
    : output

  output 
  return 
} 

test('filter', ({ same, plan }) => {
  plan(1)

  const input = emitter({ a: 1, b: 2 })
      , output = filter(([k, v]) => v % 2)(input)
      , output = x(input)(filter(([k, v]) => v % 2))

  same(
    output
  , { a: 1 }
  , 'initally transformed'
  )

  same(
    output
  , { a: 1 }
  , 'reactively transformed'
  )

  output.emit('stop')
  teared down check

})
