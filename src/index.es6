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

export function asArray (collection) { return [].slice.call(collection) }

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
