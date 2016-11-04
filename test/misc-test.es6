import expect from 'expect.js'
import sinon from 'sinon'
import {
  always,
  apply,
  asArray,
  asDataAttributes,
  asPair,
  clone,
  compose,
  curry,
  curryN,
  fill,
  identity,
  inputName,
  log,
  merge,
  never,
  pipe,
  when
} from '../src/index'

describe('misc utilities', () => {
  describe('log()', () => {
    let safeLog
    beforeEach(() => {
      safeLog = console.log
      sinon.stub(console, 'log')
    })

    it('calls the console.log method with the received value', () => {
      log('foo')
      expect(console.log.calledWith('foo')).to.be.ok()
      console.log = safeLog
    })

    it('returns the received value', () => {
      const res = log('foo')
      console.log = safeLog
      expect(res).to.be.eql('foo')
    })
  })

  describe('merge()', () => {
    it('merges two objects as a third one', () => {
      const a = {foo: 'foo', bar: 'bar'}
      const b = {bar: 'foo', baz: 'baz'}

      expect(merge(a, b)).to.eql({foo: 'foo', bar: 'foo', baz: 'baz'})
    })
  })

  describe('clone()', () => {
    it('returns a shallow copy of the passed-in object', () => {
      const a = {foo: 'foo', bar: 'bar'}
      const b = clone(a)

      expect(b).to.eql(a)
      expect(b).not.to.be(a)
    })
  })

  describe('asArray()', () => {
    it('converts an array like object into an array', () => {
      const a = {length: 2, '0': 'foo', '1': 'bar'}
      const b = asArray(a)

      expect(b).to.eql(['foo', 'bar'])
    })
  })

  describe('.asPair()', () => {
    it('converts an object into an of tuples with the pairs key:value', () => {
      const o = {foo: 10, bar: 'baz', baz: true}
      const a = asPair(o)

      expect(a).to.eql([
        ['foo', 10],
        ['bar', 'baz'],
        ['baz', true]
      ])
    })
  })

  describe('asDataAttributes', () => {
    it('converts an object into a string of data-attributes', () => {
      const o = {foo: 10, bar: 'baz', baz: true}
      const html = asDataAttributes(o)

      expect(html).to.eql('data-foo="10" data-bar="baz" data-baz')
    })
  })

  describe('curry()', () => {
    it('detects the number of arguments of a function and curries it accordingly', () => {
      function foo (a, b, c, d) {
        return a + b + c + d
      }

      let bar = curry(foo)
      expect(typeof bar).to.eql('function')

      bar = bar(1)
      expect(typeof bar).to.eql('function')
      expect(bar(2, 3, 4)).to.eql(10)

      bar = bar(2)
      expect(typeof bar).to.eql('function')
      expect(bar(3, 4)).to.eql(10)

      bar = bar(3)
      expect(typeof bar).to.eql('function')
      expect(bar(4)).to.eql(10)
    })
  })

  describe('curryN()', () => {
    it('curries a function to receive the specified amount of arguments', () => {
      function foo (a, b, c = 0, d = 0) {
        return a + b + c + d
      }

      let bar = curryN(2, foo)
      expect(typeof bar).to.eql('function')

      bar = bar(1)
      expect(typeof bar).to.eql('function')
      expect(bar(2, 3, 4)).to.eql(3)

      bar = bar(2)
      expect(typeof bar).to.eql('number')
    })
  })

  describe('apply()', () => {
    it('calls the function with the passed-in arguments array', () => {
      function foo (a, b, c = 0, d = 0) {
        return a + b + c + d
      }

      expect(apply(foo, [1, 2, 3, 4])).to.eql(10)
    })

    it('curries the function if called without the arguments', () => {
      function foo (a, b, c = 0, d = 0) {
        return a + b + c + d
      }

      const bar = apply(foo)

      expect(bar([1, 2, 3, 4])).to.eql(10)
    })
  })

  describe('identity()', () => {
    it('returns the argument it receive', () => {
      const o = {foo: 'bar'}

      expect(identity(o)).to.be(o)
    })
  })

  describe('always()', () => {
    it('always returns true', () => {
      expect(always()).to.be.ok()
    })
  })

  describe('never()', () => {
    it('always returns false', () => {
      expect(never()).not.to.be.ok()
    })
  })

  describe('when()', () => {
    describe('given an array of tuples predicate/action', () => {
      let _when

      beforeEach(() => {
        _when = when([
          [a => a === 'foo', a => 'FOO'],
          [a => a === 'bar', a => 'BAR'],
          [always, identity]
        ])
      })

      it('evaluates the predicates against a value and calls action when a predicate match', () => {
        expect(_when('foo')).to.eql('FOO')
        expect(_when('bar')).to.eql('BAR')
        expect(_when('baz')).to.eql('baz')
      })
    })
  })

  describe('compose()', () => {
    it('executes functions from right to left', () => {
      const foo = (a, b, c, d) => a + b + c + d
      const bar = n => n * 4
      const baz = n => n + 2

      const fn = compose(baz, bar, foo)

      expect(fn(1, 2, 3, 4)).to.eql(42)
    })
  })

  describe('pipe()', () => {
    it('executes functions from left to right', () => {
      const foo = (a, b, c, d) => a + b + c + d
      const bar = n => n * 4
      const baz = n => n + 2

      const fn = pipe(foo, bar, baz)

      expect(fn(1, 2, 3, 4)).to.eql(42)
    })
  })

  describe('inputName()', () => {
    describe('by default', () => {
      it('joins fields using [ and ]', () => {
        const fn = inputName()

        expect(fn('foo')).to.eql('foo')
        expect(fn('foo', 0, 'bar')).to.eql('foo[0][bar]')
      })
    })

    describe('with both prefix and suffix options', () => {
      it('joins fields using the prefix and suffix', () => {
        const fn = inputName({prefix: '(', suffix: ')'})

        expect(fn('foo')).to.eql('foo')
        expect(fn('foo', 0, 'bar')).to.eql('foo(0)(bar)')
      })
    })

    describe('with only the prefix option', () => {
      it('joins fields using the prefix and suffix', () => {
        const fn = inputName({prefix: '_'})

        expect(fn('foo')).to.eql('foo')
        expect(fn('foo', 0, 'bar')).to.eql('foo_0_bar')
      })
    })

    describe('with only the suffix option', () => {
      it('joins fields using the prefix and suffix', () => {
        const fn = inputName({suffix: '_'})

        expect(fn('foo')).to.eql('foo')
        expect(fn('foo', 0, 'bar')).to.eql('foo0_bar_')
      })
    })
  })

  describe('fill()', () => {
    it('builds an array of the specified length with the given content', () => {
      const arr = fill(10, 'foo')

      expect(arr).to.have.length(10)
      expect(arr.every(v => v === 'foo')).to.be.ok()
    })

    it('returns a function when called with only a length', () => {
      const fn = fill(2)

      expect(typeof fn).to.eql('function')
      expect(fn('foo')).to.eql(['foo', 'foo'])
      expect(fn('bar')).to.eql(['bar', 'bar'])
    })
  })

  })
})
