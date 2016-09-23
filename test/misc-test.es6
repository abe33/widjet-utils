import expect from 'expect.js'
import {merge, clone, asArray} from '../src/index'

describe('misc utilities', () => {
  describe('.merge()', () => {
    it('merges two objects as a third one', () => {
      const a = {foo: 'foo', bar: 'bar'}
      const b = {bar: 'foo', baz: 'baz'}

      expect(merge(a, b)).to.eql({foo: 'foo', bar: 'foo', baz: 'baz'})
    })
  })

  describe('.clone()', () => {
    it('returns a shallow copy of the passed-in object', () => {
      const a = {foo: 'foo', bar: 'bar'}
      const b = clone(a)

      expect(b).to.eql(a)
      expect(b).not.to.be(a)
    })
  })

  describe('.asArray()', () => {
    it('converts an array like object into an array', () => {
      const a = {length: 2, '0': 'foo', '1': 'bar'}
      const b = asArray(a)

      expect(b).to.eql(['foo', 'bar'])
    })
  })
})
