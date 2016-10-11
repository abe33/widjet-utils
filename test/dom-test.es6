import expect from 'expect.js'
import sinon from 'sinon'
import jsdom from 'mocha-jsdom'

import {getNode, getNodes, cloneNode, nodeIndex, detachNode, animate, parents, parent, nodeAndParents, clearNodeCache} from '../src/index'

const textContent = (n) => n.innerText || n.textContent

describe('DOM utils', () => {
  jsdom()

  beforeEach(() => { clearNodeCache() })

  describe('getNode()', () => {
    it('returns undefined when called without HTML', () => {
      expect(getNode()).to.be(undefined)
    })

    it('returns a Node element from a string', () => {
      const node = getNode('<div class="foo">bar</div>')

      expect(node.nodeType).to.eql(1)
      expect(node.nodeName).to.eql('DIV')
      expect(node.classList.contains('foo')).to.be.ok()
      expect(textContent(node)).to.eql('bar')
    })

    it('ignores text nodes at the beginning of the string', () => {
      const node = getNode('foo <div class="foo">bar</div>')

      expect(node.classList.contains('foo')).to.be.ok()
      expect(textContent(node)).to.eql('bar')
    })

    it('ignores element nodes after the first one', () => {
      const node = getNode('<div class="foo">bar</div><div class="bar">foo</div>')

      expect(node.classList.contains('foo')).to.be.ok()
      expect(textContent(node)).to.eql('bar')
    })

    it('ignores text nodes', () => {
      expect(getNode('foo')).to.be(null)
    })
  })

  describe('getNodes()', () => {
    it('returns all the nodes corresponding to a HTML string', () => {
      const nodes = getNodes('<div class="foo">bar</div> foo <span class="bar">foo</span>')

      expect(nodes).to.have.length(3)
      expect(nodes[0].nodeType).to.eql(1)
      expect(nodes[0].nodeName).to.eql('DIV')
      expect(nodes[0].classList.contains('foo')).to.be.ok()
      expect(textContent(nodes[0])).to.eql('bar')

      expect(nodes[1].nodeType).to.eql(3)
      expect(textContent(nodes[1])).to.match(/\s*foo\s*/)

      expect(nodes[2].nodeType).to.eql(1)
      expect(nodes[2].nodeName).to.eql('SPAN')
      expect(nodes[2].classList.contains('bar')).to.be.ok()
      expect(textContent(nodes[2])).to.eql('foo')
    })

    it('returns an empty array if no string is passed', () => {
      expect(getNodes()).to.be.empty()
    })
  })

  describe('cloneNode()', () => {
    it('returns a copy of the passed-in node', () => {
      const original = getNode('<div class="foo">bar</div>')
      const clone = cloneNode(original)

      expect(clone.nodeType).to.eql(original.nodeType)
      expect(clone.nodeName).to.eql(original.nodeName)
      expect(clone.className).to.eql(original.className)
      expect(textContent(clone)).to.eql(textContent(original))
    })

    it('returns undefined if no node is passed', () => {
      expect(cloneNode()).to.be(undefined)
    })
  })

  describe('nodeIndex()', () => {
    it('returns the index of a node inside its parent children list', () => {
      const node = getNode('<div><p>A</p><p>B</p><p>C</p></div>')

      const child = node.children[1]

      expect(nodeIndex(child)).to.eql(1)
      expect(nodeIndex(child.previousSibling)).to.eql(0)
      expect(nodeIndex(child.nextSibling)).to.eql(2)
    })

    it('returns -1 if the node does not have a parent', () => {
      const node = getNode('<div><p>A</p><p>B</p><p>C</p></div>')

      expect(nodeIndex(node)).to.eql(-1)
    })

    it('returns -1 if no node is passed', () => {
      expect(nodeIndex()).to.eql(-1)
    })
  })

  describe('detachNode()', () => {
    it('detaches a node from its parent', () => {
      const node = getNode('<div><p>A</p><p>B</p><p>C</p></div>')

      const child = node.children[1]

      detachNode(child)

      expect(child.parentElement).to.be(null)
    })
  })

  describe('animate()', () => {
    beforeEach(() => {
      window.requestAnimationFrame = (fn) => setTimeout(fn, 1000 / 60)
    })

    it('calls the passed-in step function as many time as needed to perform the animation', (done) => {
      const spy = sinon.spy()

      animate({
        from: 0,
        to: 100,
        duration: 100,
        step: spy,
        end: () => {
          expect(spy.calledWith(0)).to.be.ok()
          expect(spy.calledWith(100)).to.be.ok()
          expect(spy.callCount).not.to.be.below(2)
          done()
        }
      })
    })

    describe('with a duration of 0', () => {
      it('jumps directly to the target value', () => {
        const spy = sinon.spy()
        animate({
          from: 0,
          to: 100,
          duration: 0,
          step: spy
        })

        expect(spy.calledWith(0)).not.to.be.ok()
        expect(spy.calledWith(100)).to.be.ok()
        expect(spy.callCount).to.eql(1)
      })
    })
  })

  describe('ancestors traversing', () => {
    let [root, node] = []

    beforeEach(() => {
      root = getNode('<div class="root"><div class="foo"><div class="bar"><div class="child"></div></div></div></div>')

      node = root.querySelector('.child')

      document.body.appendChild(root)
    })

    describe('parents()', () => {
      describe('when called without a selector', () => {
        it('returns an array of all the parent of the node', () => {
          expect(parents(node)).to.have.length(5)
          expect(parents(node).map(n => n.nodeName)).to.eql([
            'DIV',
            'DIV',
            'DIV',
            'BODY',
            'HTML'
          ])
        })
      })

      describe('when called with a selector', () => {
        it('returns an array of all the parent of the node', () => {
          expect(parents(node, 'div')).to.have.length(3)

          expect(parents(node, '.foo')).to.eql([root.querySelector('.foo')])
          expect(parents(node, '.root .bar')).to.eql([root.querySelector('.bar')])
          expect(parents(node, '.root')).to.eql([root])
        })
      })
    })

    describe('parent()', () => {
      describe('when called without a selector', () => {
        it('returns the direct parent of a node', () => {
          expect(parent(node)).to.eql(root.querySelector('.bar'))
        })
      })

      describe('when called with a selector', () => {
        it('returns the ancestor of the node that matches the selector', () => {
          expect(parent(node, '.foo')).to.eql(root.querySelector('.foo'))
        })
      })
    })

    describe('nodeAndParents()', () => {
      describe('when called without a selector', () => {
        it('returns an array of all the parent of the node', () => {
          expect(nodeAndParents(node)).to.have.length(6)
          expect(nodeAndParents(node).map(n => n.nodeName)).to.eql([
            'DIV',
            'DIV',
            'DIV',
            'DIV',
            'BODY',
            'HTML'
          ])
        })
      })

      describe('when called with a selector', () => {
        it('returns an array of all the parent of the node', () => {
          expect(nodeAndParents(node, 'div')).to.have.length(4)

          expect(nodeAndParents(node, '.foo')).to.eql([node, root.querySelector('.foo')])
          expect(nodeAndParents(node, '.root .bar')).to.eql([node, root.querySelector('.bar')])
          expect(nodeAndParents(node, '.root')).to.eql([node, root])
        })
      })
    })
  })
})
