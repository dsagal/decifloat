# decifloat
[![Build Status](https://travis-ci.org/dsagal/decifloat.svg?branch=master)](https://travis-ci.org/dsagal/decifloat)
[![Coverage Status](https://coveralls.io/repos/github/dsagal/decifloat/badge.svg?branch=master)](https://coveralls.io/github/dsagal/decifloat?branch=master)
[![npm version](https://badge.fury.io/js/decifloat.svg)](https://badge.fury.io/js/decifloat)

> Format floats as decimals with expected rounding

This module formats floats to a given number of decimals with expected rounding, fixing some
surprises with native Javascript method
[toFixed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed).
It seeks to do this with minimal overhead.

:warning: __Consider Intl.NumberFormat__

> While the module works, the modern recommendation is to use the built-in [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) module, which implements expected rounding with similar performance and many more options. See [Comparisons](#comparisons) below.

## Installation

```
npm install --save decifloat
```

## Usage

### decifloat.toFixed(num, minDecimals, maxDecimals, roundingFunc = Math.round)

Formats `num` to at least `minDecimals` and at most `maxDecimals` decimal digits after the decimal point.

```typescript
import {toFixed} from 'decifloat';
console.log(toFixed(1.005, 0, 2));    // Outputs 1.01
console.log(toFixed(1.005, 0, 5));    // Outputs 1.005
console.log(toFixed(1.005, 5, 5));    // Outputs 1.00500
console.log(toFixed(1.005, 0, 1));    // Outputs 1
```

# Explanation

Floats in Javascript (as in most modern languages) are represented using powers of 2, which means
that most decimal fractions are not represented precisely. For example, 1.005 is not representable
precisely in Javascript, and is represented by a slightly smaller number.

The native methods of `Number` such as [toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)
and [toExponential()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential)
do a good job of formatting this slightly smaller number back as `"1.005"` for output.

However, because Javascript's 1.005 is actually a slightly smaller than the mathematical 1.005, rounding to two
decimal digits, as done by `(1.005).toFixed(2)`, produces `"1.00"`, which looks wrong. For the
same reason, `1.005 * 100` produces `100.49999999999999`.

This module solves this issue by scaling `"1.005"` to `"100.5"` as a string before rounding. Because
it doesn't lose precision in scaling by powers of 10, `decifloat.toFixed(1.005, 2, 2)` can
correctly produce `"1.01"`.

Beyond that, it aims to be fast. In many cases (at least on node 10) it's actually faster than
the native `toFixed()` method.

# Comparisons

The times below were measured on a MacBook Pro. To produce them yourself, run `npm run bench-node` for node timings, or run `npm run bench-browser` and open `test/fixtures/bench.html` in a browser for browser timings.

| Library / Code | Result 1 | Result 2 | Result 3 |
| -------------- | -------: | -------: | -------: |
decifloat.toFixed(val, 1, 8)    |           1.00000001 |           -123456.79 |           0.00000062 |
val.toFixed(8)                  |          ⚠️1.00000000 |     -123456.79000000 |           0.00000062 |
numeral(val).format(fmt)        |           1.00000001 |           -123456.79 |                ⚠️NaN |
numberFormat.format(val)        |           1.00000001 |           -123456.79 |           0.00000062 |

| Library / Code | Time in Node 10 (ms) | Time in Firefox | Time in Chrome | Time in Safari
| -------------- | -------------------- | --------------- | -------------- | --------------
decifloat.toFixed(val, 1, 8)    |0.52 us | 0.66 us | 0.60 us | 1.37 us
val.toFixed(8)                  | 0.35 us | 0.22 us | 0.42 us | 0.13 us
numeral(val).format(fmt)        | 2.68 us  | 3.32 us | 5.19 us | 3.66 us
numberFormat.format(val)        | 0.78 us | 0.49 us | 0.75 us | 0.66 us

Above, for `numeral`, the format `fmt` is `"0.0[0000000]"`. In the line with `numberFormat`, it is set to:

```
const numberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 8, useGrouping: false});
```

Note that this last approach is well-supported, and similarly efficient. It may be a simpler
approach, at least if you are sure that you have support for a suitable locale.
