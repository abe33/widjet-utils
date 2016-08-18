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
