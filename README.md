# widjet-utils [![Build Status](https://travis-ci.org/abe33/widjet-utils.svg?branch=master)](https://travis-ci.org/abe33/widjet-utils)

JS utilities for widjet widgets.

## Install

```sh
npm install --save widjet-utils
```

## Usage

```js
import {getNode, merge} from 'widjet-utils'
```

### merge

Takes two object `a` and `b` and return the result of merging `b` in `a`. Every colliding properties will be overriden with the version from `b` object.

```js
import {merge} from 'widjet-utils'

const a = {foo: 'foo', bar: 'bar'}
const b = {bar: 'BAR', baz: 'BAZ'}

const c = merge(a, b)
// c = {foo: 'foo', bar: 'BAR', baz: 'BAZ'}
```

### clone

Performs a shallow clone of the passed-in object.


```js
import {clone} from 'widjet-utils'

const a = {foo: 'foo', deep: {bar: 'BAR', baz: 'BAZ'}}

const b = clone(a)
// b = {foo: 'foo', deep: {bar: 'BAR', baz: 'BAZ'}}
// a.deep === b.deep
```

### asArray

Converts an array-like object into a proper array.

```js
import {asArray} from 'widjet-utils'

const a = asArray(document.querySelectorAll('div'))
```

### getNode

Returns a DOM node corresponding to the passed-in string.

```js
import {getNode} from 'widjet-utils'

const node = getNode('<div class="foo">bar</div>')
```

### getNodes

Returns an array of DOM nodes corresponding to the passed-in string.

```js
import {getNodes} from 'widjet-utils'

const nodes = getNodes('<div class="foo">bar</div><div class="bar">foo</div>')
```

### clearNodeCache

Clears the node used by `getNode` and `getNodes` method. Useful in test environment.

### cloneNode

Returns a copy of the passed-in node.

```js
import {cloneNode, getNode} from 'widjet-utils'

const node = getNode('<div class="foo">bar</div>')
const copy = cloneNode(node)
```

### nodeIndex

Returns the node index in its parent children collection.

```js
import {nodeIndex} from 'widjet-utils'

const node = document.querySelector('div')
const index = nodeIndex(node)
```

### detachNode

Removes the passed-in node from its parent.

```js
import {detachNode} from 'widjet-utils'

const node = document.querySelector('div')
detachNode(node)
```

### animate

Performs a transition from a value to another during a specified duration. A callback function is called on each frame during the transition with the current step value.

```js
import {animate} from 'widjet-utils'

const node = document.querySelector('div')

animate({
  from: 0,
  to: 100,
  duration: 500,
  step: (value) => { node.style.left = value + 'px' },
  end: () => { console.log('transition ended') }
})
```

### eachParent

Iterates over the ancestors of a given node.

```js
import {eachParent} from 'widjet-utils'

const node = document.querySelector('div')

eachParent(node, (parent) => {
  // ...
})
```

### parents

Returns an array of all the node's parents that matches the passed-in selector.

```js
import {parents} from 'widjet-utils'

const node = document.querySelector('div')

const allParents = parents(node)
const parentDivs = parents(node, 'div')
```

### parent

Return the first parent of the passed-in element that matches the specified selector.

```js
import {parent} from 'widjet-utils'

const node = document.querySelector('div')

const firstParent = parent(node)
const firstParentDiv = parent(node, 'div')
```

### nodeAndParents

Returns an array with the node and all its parents that matches the passed-in selector.

```js
import {nodeAndParents} from 'widjet-utils'

const node = document.querySelector('div')

const nodeAndAllParents = nodeAndParents(node)
const nodeAndParentDivs = nodeAndParents(node, 'div')
```

### domEvent

Creates an `Event` object that can be dispatched using the `dispatchEvent` of a HTML element.

```js
import {domEvent} from 'widjet-utils'

const event = domEvent('change')
const input = document.querySelector('input')

input.dispatchEvent(event)
```

### addDelegatedEventListener

Registers an event listener on a root element but targeting events from its children using a CSS selector to determine which children are observed.

The main purpose of such function is to allow to listen for events on elements that may or may not exist, or that can exist in great quantity, without having to care about their addition into or removal from the DOM.

Since bubbling occurs prior to the event handling on the root element, propagation cancelation will only be possible from the root element up to the document. However, if several delegated event listeners have been registered on the same root, but targeting elements that are at different level of the hierarchy. Stopping the propagation on a listener will prevent the less deeper handlers to be invoked.

```js
import {addDelegatedEventListener} from 'widjet-utils'

const root = document.querySelector('div')

addDelegatedEventListener(root, 'click', '.foo', (e) => {
  console.log("I'll be called only if the click wasn't done on a .child element")
})
addDelegatedEventListener(root, 'click', '.foo .child', (e) => {
  e.stopPropagation()
})
```
