import expect from 'expect.js'
import sinon from 'sinon'
import jsdom from 'mocha-jsdom'

import {domEvent, addDelegatedEventListener} from '../src/index'

describe('events utils', () => {
  jsdom()

  let [root, node, spy] = []

  beforeEach(() => {
    document.body.innerHTML = '<div class="root"><div class="foo"><div class="child"></div></div><div class="bar"><div class="child"></div></div></div>'

    root = document.body.querySelector('.root')
    node = root.querySelector('.child')

    spy = sinon.spy()
  })

  describe('addDelegatedEventListener()', () => {
    describe('when registered on a root node without a selector', () => {
      it('triggers the listener whatever the target', () => {
        addDelegatedEventListener(root, 'click', spy)

        node.dispatchEvent(domEvent('click'))

        expect(spy.called).to.be.ok()
      })
    })

    describe('when registered on a root node with a selector', () => {
      it('triggers the listener only if the target or its ancestors matches the selector', () => {
        addDelegatedEventListener(root, 'click', '.foo', spy)

        node = root.querySelector('.bar .child')
        node.dispatchEvent(domEvent('click'))

        expect(spy.called).not.to.be.ok()

        node = root.querySelector('.foo .child')
        node.dispatchEvent(domEvent('click'))

        expect(spy.called).to.be.ok()
      })
    })

    describe('when two listeners are added at different level of the tree', () => {
      it('does not trigger the top listener if the propagation have been stopped', () => {
        addDelegatedEventListener(root, 'click', '.foo .child', (e) => {
          e.stopPropagation()
        })
        addDelegatedEventListener(root, 'click', '.foo', spy)

        node = root.querySelector('.foo .child')
        node.dispatchEvent(domEvent('click'))

        expect(spy.called).not.to.be.ok()
      })
    })

    describe('when two listeners are added at the same level of the tree', () => {
      it('does not trigger the second listener if the immediate propagation have been stopped', () => {
        addDelegatedEventListener(root, 'click', '.foo', (e) => {
          e.stopImmediatePropagation()
        })
        addDelegatedEventListener(root, 'click', '.foo', spy)

        node = root.querySelector('.foo .child')
        node.dispatchEvent(domEvent('click'))

        expect(spy.called).not.to.be.ok()
      })
    })
  })
})
