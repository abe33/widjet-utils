import {DisposableEvent} from 'widjet-disposables';

//  ######  ######## ########
// ##    ##    ##    ##     ##
// ##          ##    ##     ##
//  ######     ##    ##     ##
//       ##    ##    ##     ##
// ##    ##    ##    ##     ##
//  ######     ##    ########

export function merge(a, b) {
  const c = {};

  for (let k in a) { c[k] = a[k]; }
  for (let k in b) { c[k] = b[k]; }

  return c;
}

export function clone(object) {
  const copy = {};
  for (let k in object) { copy[k] = object[k]; }
  return copy;
}

const slice = Array.prototype.slice;

const _curry = (n, fn, curryArgs = []) => {
  return (...args) => {
    const concatArgs = curryArgs.concat(args);

    return n > concatArgs.length
      ? _curry(n, fn, concatArgs)
      : fn.apply(null, concatArgs);
  };
};

export function curry(fn) { return _curry(fn.length, fn); }

export function curryN(n, fn) { return _curry(n, fn); }

export const curry1 = curryN(2, curryN)(1);
export const curry2 = curryN(2, curryN)(2);
export const curry3 = curryN(2, curryN)(3);
export const curry4 = curryN(2, curryN)(4);

export const apply = curry2((fn, args) => fn.apply(null, args));

export const identity = a => a;
export const always = a => true;
export const never = a => false;
export const head = a => a[0];
export const last = a => a[a.length - 1];
export const tail = a => a.slice(1);
export const init = a => a.slice(0, -1);

export const when = curry2((predicates, ...values) => {
  const doWhen = (a) => {
    const [predicate, resolve] = head(a);
    return predicate(...values) ? resolve(...values) : doWhen(tail(a));
  };

  return doWhen(predicates);
});

export function compose(...fns) {
  fns.push(apply(fns.pop()));
  return (...args) => fns.reduceRight((memo, fn) => fn(memo), args);
}

export function pipe(...fns) {
  fns[0] = apply(fns[0]);
  return (...args) => fns.reduce((memo, fn) => fn(memo), args);
}

export const asArray = (collection) => slice.call(collection);
export const asPair = (object) => Object.keys(object).map((k) => [k, object[k]]);

export const asDataAttributes = (o) =>
  asPair(o)
    .map(([k, v]) => typeof v === 'boolean' ? (v ? k : '') : `${k}="${v}"`)
    .map(s => `data-${s}`)
    .join(' ');

export const inputName = (options = {prefix: '[', suffix: ']'}) => {
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';

  return (...args) =>
    [head(args)].concat(tail(args).map(s => `${prefix}${s}${suffix}`)).join('');
};

export const log = (v) => { console.log(v); return v; };

export const fill = curry2((len, value) => new Array(len).fill(value));

export const mapEach = curry2((maps, values) =>
  values.map((v, i) => maps[i % maps.length](v))
);

// ########   #######  ##     ##
// ##     ## ##     ## ###   ###
// ##     ## ##     ## #### ####
// ##     ## ##     ## ## ### ##
// ##     ## ##     ## ##     ##
// ##     ## ##     ## ##     ##
// ########   #######  ##     ##

let previewNode;

export function clearNodeCache() {
  previewNode = null;
}

export function getNode(html) {
  if (!html) { return undefined; }
  if (previewNode == null) { previewNode = document.createElement('div'); }

  previewNode.innerHTML = html;
  const node = previewNode.firstElementChild;
  if (node) { previewNode.removeChild(node); }
  previewNode.innerHTML = '';
  return node || null;
}

export function getNodes(html) {
  if (!html) { return []; }
  if (previewNode == null) { previewNode = document.createElement('div'); }

  previewNode.innerHTML = html;
  const nodes = asArray(previewNode.childNodes);
  nodes.forEach(n => previewNode.removeChild(n));
  previewNode.innerHTML = '';
  return nodes;
}

export function cloneNode(node) {
  return node ? getNode(node.outerHTML) : undefined;
}

export function nodeIndex(node) {
  return node && node.parentNode
    ? ([]).indexOf.call(node.parentNode.children, node)
    : -1;
}

export function detachNode(node) {
  node && node.parentNode && node.parentNode.removeChild(node);
}

export function animate({from, to, duration, step, end}) {
  const start = getTime();

  update();

  function getTime() { return new Date(); }

  function swing(progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  function update() {
    const passed = getTime() - start;
    const progress = Math.min(1, duration === 0 ? 1 : passed / duration);
    const delta = swing(progress);

    step(from + (to - from) * delta, delta);

    progress < 1
      ? window.requestAnimationFrame(update)
      : end && end();
  }
}

// ########     ###    ########  ######## ##    ## ########  ######
// ##     ##   ## ##   ##     ## ##       ###   ##    ##    ##    ##
// ##     ##  ##   ##  ##     ## ##       ####  ##    ##    ##
// ########  ##     ## ########  ######   ## ## ##    ##     ######
// ##        ######### ##   ##   ##       ##  ####    ##          ##
// ##        ##     ## ##    ##  ##       ##   ###    ##    ##    ##
// ##        ##     ## ##     ## ######## ##    ##    ##     ######

export function eachParent(node, block) {
  let parent = node.parentNode;

  while (parent) {
    block(parent);

    if (parent.nodeName === 'HTML') { break; }
    parent = parent.parentNode;
  }
}

export function parents(node, selector = '*') {
  const parentNodes = [];

  eachParent(node, (parent) => {
    if (parent.matches && parent.matches(selector)) { parentNodes.push(parent); }
  });

  return parentNodes;
}

export function parent(node, selector = '*') {
  return parents(node, selector)[0];
}

export function nodeAndParents(node, selector = '*') {
  return [node].concat(parents(node, selector));
}

// ######## ##     ## ######## ##    ## ########  ######
// ##       ##     ## ##       ###   ##    ##    ##    ##
// ##       ##     ## ##       ####  ##    ##    ##
// ######   ##     ## ######   ## ## ##    ##     ######
// ##        ##   ##  ##       ##  ####    ##          ##
// ##         ## ##   ##       ##   ###    ##    ##    ##
// ########    ###    ######## ##    ##    ##     ######

function appendData(data, event) {
  if (data) { event.data = data; }
  return event;
}

export const newEvent = (type, data, props) =>
  appendData(data, new window.Event(type, {
    bubbles: props.bubbles != null ? props.bubbles : true,
    cancelable: props.cancelable != null ? props.cancelable : true,
  }));

export const createEvent = (type, data, props) => {
  const event = document.createEvent('Event');
  event.initEvent(
    type,
    props.bubbles != null ? props.bubbles : true,
    props.cancelable != null ? props.cancelable : true
  );
  return appendData(data, event);
};

export const createEventObject = (type, data, props) => {
  const event = document.createEventObject();
  event.type = type;
  event.cancelBubble = props.bubbles === false;
  delete props.bubbles;
  for (var k in props) { event[k] = props[k]; }
  return appendData(data, event);
};

let domEventImplementation;
export const domEvent = (type, data, props = {}) => {
  if (!domEventImplementation) {
    try {
      const e = new window.Event('test');
      domEventImplementation = e && newEvent;
    } catch (e) {
      domEventImplementation = document.createEvent
        ? createEvent
        : createEventObject;
    }
  }

  return domEventImplementation(type, data, props);
};

export function addDelegatedEventListener(object, event, selector, callback) {
  if (typeof selector === 'function') {
    callback = selector;
    selector = '*';
  }

  const listener = e => {
    if (e.isPropagationStopped) { return; }

    let {target} = e;
    decorateEvent(e);
    nodeAndParents(target).forEach((node) => {
      const matched = node.matches(selector);
      if (e.isImmediatePropagationStopped || !matched) { return; }

      e.matchedTarget = node;
      callback(e);
    });
  };

  return new DisposableEvent(object, event, listener);

  function decorateEvent(e) {
    const overriddenStop = window.Event.prototype.stopPropagation;
    e.stopPropagation = function() {
      this.isPropagationStopped = true;
      overriddenStop.apply(this, arguments);
    };

    const overriddenStopImmediate = window.Event.prototype.stopImmediatePropagation;
    e.stopImmediatePropagation = function() {
      this.isImmediatePropagationStopped = true;
      overriddenStopImmediate.apply(this, arguments);
    };
  }
}
