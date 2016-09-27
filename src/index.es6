import {DisposableEvent} from 'widjet-disposables'

//  ######  ######## ########
// ##    ##    ##    ##     ##
// ##          ##    ##     ##
//  ######     ##    ##     ##
//       ##    ##    ##     ##
// ##    ##    ##    ##     ##
//  ######     ##    ########

export function merge (a, b) {
  const c = {}

  for (let k in a) { c[k] = a[k] }
  for (let k in b) { c[k] = b[k] }

  return c
}

export function clone (object) {
  const copy = {}
  for (let k in object) { copy[k] = object[k] }
  return copy
}

const slice = Array.prototype.slice

const _curry = (n, fn, curryArgs = []) => (...args) => {
  const concatArgs = curryArgs.concat(args)

  return n > concatArgs.length
    ? _curry(n, fn, concatArgs)
    : fn.apply(null, slice.call(concatArgs, 0, n))
}

export function curry (fn) { return _curry(fn.length, fn) }

export function curryN (n, fn) { return _curry(n, fn) }

export const curry1 = curryN(2, curryN)(1)
export const curry2 = curryN(2, curryN)(2)
export const curry3 = curryN(2, curryN)(3)
export const curry4 = curryN(2, curryN)(4)

export const apply = curry2((fn, args) => fn.apply(null, args))

export const identity = a => a
export const always = a => true
export const never = a => false

export const when = curry2((predicates, value) => {
  const {length} = predicates
  for (let i = 0; i < length; i++) {
    const [predicate, resolve] = predicates[i]

    if (predicate(value)) { return resolve(value) }
  }
})

export function compose (...fns) {
  fns.push(apply(fns.pop()))
  return (...args) => fns.reduceRight((memo, fn) => fn(memo), args)
}

export function pipe (...fns) {
  fns[0] = apply(fns[0])
  return (...args) => fns.reduce((memo, fn) => fn(memo), args)
}

export function asArray (collection) { return slice.call(collection) }

// ########   #######  ##     ##
// ##     ## ##     ## ###   ###
// ##     ## ##     ## #### ####
// ##     ## ##     ## ## ### ##
// ##     ## ##     ## ##     ##
// ##     ## ##     ## ##     ##
// ########   #######  ##     ##

let previewNode

export function clearNodeCache () {
  previewNode = null
}

export function getNode (html) {
  if (!html) { return undefined }
  if (previewNode == null) { previewNode = document.createElement('div') }

  previewNode.innerHTML = html
  const node = previewNode.firstElementChild
  previewNode.innerHTML = ''
  return node
}

export function getNodes (html) {
  if (!html) { return [] }
  if (previewNode == null) { previewNode = document.createElement('div') }

  previewNode.innerHTML = html
  const nodes = asArray(previewNode.childNodes)
  previewNode.innerHTML = ''
  return nodes
}

export function cloneNode (node) {
  return node ? getNode(node.outerHTML) : undefined
}

export function nodeIndex (node) {
  return node && node.parentNode
    ? ([]).indexOf.call(node.parentNode.children, node)
    : -1
}

export function detachNode (node) {
  node.parentNode && node.parentNode.removeChild(node)
}

export function animate ({from, to, duration, step, end}) {
  const start = getTime()
  let progress

  update()

  function getTime () { return new Date() }

  function swing (progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2
  }

  function update () {
    const passed = getTime() - start
    if (duration === 0) {
      progress = 1
    } else {
      progress = passed / duration
    }
    if (progress > 1) { progress = 1 }
    const delta = swing(progress)
    const value = from + (to - from) * delta
    step(value, delta)

    if (progress < 1) {
      window.requestAnimationFrame(update)
    } else {
      end && end()
    }
  }
}

// ########     ###    ########  ######## ##    ## ########  ######
// ##     ##   ## ##   ##     ## ##       ###   ##    ##    ##    ##
// ##     ##  ##   ##  ##     ## ##       ####  ##    ##    ##
// ########  ##     ## ########  ######   ## ## ##    ##     ######
// ##        ######### ##   ##   ##       ##  ####    ##          ##
// ##        ##     ## ##    ##  ##       ##   ###    ##    ##    ##
// ##        ##     ## ##     ## ######## ##    ##    ##     ######

export function eachParent (node, block) {
  let parent = node.parentNode

  while (parent) {
    block(parent)

    if (parent.nodeName === 'HTML') { break }
    parent = parent.parentNode
  }
}

export function parents (node, selector = '*') {
  const parentNodes = []

  eachParent(node, (parent) => {
    if (parent.matches && parent.matches(selector)) { parentNodes.push(parent) }
  })

  return parentNodes
}

export function parent (node, selector = '*') {
  return parents(node, selector)[0]
}

export function nodeAndParents (node, selector = '*') {
  return [node].concat(parents(node, selector))
}

// ######## ##     ## ######## ##    ## ########  ######
// ##       ##     ## ##       ###   ##    ##    ##    ##
// ##       ##     ## ##       ####  ##    ##    ##
// ######   ##     ## ######   ## ## ##    ##     ######
// ##        ##   ##  ##       ##  ####    ##          ##
// ##         ## ##   ##       ##   ###    ##    ##    ##
// ########    ###    ######## ##    ##    ##     ######

export function domEvent (type, data = {}, options = {}) {
  const {bubbles, cancelable} = options
  let event

  try {
    event = new window.Event(type, {
      bubbles: bubbles != null ? bubbles : true,
      cancelable: cancelable != null ? cancelable : true
    })
  } catch (e) {
    if ((document.createEvent != null)) {
      event = document.createEvent('Event')
      event.initEvent(
        type,
        bubbles != null ? bubbles : true,
        cancelable != null ? cancelable : true
      )
    } else if (document.createEventObject) {
      event = document.createEventObject()
      event.type = type
      for (var k in options) { event[k] = options[k] }
    }
  }

  event.data = data
  return event
}

export function addDelegatedEventListener (object, event, selector, callback) {
  if (typeof selector === 'function') {
    callback = selector
    selector = '*'
  }

  const listener = e => {
    if (e.isPropagationStopped) { return }

    let {target} = e
    decorateEvent(e)
    nodeAndParents(target).forEach((node) => {
      const matched = node.matches(selector)
      if (e.isImmediatePropagationStopped || !matched) { return }

      e.matchedTarget = node
      callback(e)
    })
  }

  return new DisposableEvent(object, event, listener)

  function decorateEvent (e) {
    const overriddenStop = window.Event.prototype.stopPropagation
    e.stopPropagation = function () {
      this.isPropagationStopped = true
      overriddenStop.apply(this, arguments)
    }

    const overriddenStopImmediate = window.Event.prototype.stopImmediatePropagation
    e.stopImmediatePropagation = function () {
      this.isImmediatePropagationStopped = true
      overriddenStopImmediate.apply(this, arguments)
    }
  }
}
