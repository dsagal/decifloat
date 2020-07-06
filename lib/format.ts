import {toFixed} from './index';

interface FormatOptions {
  minDecimals: number;
  maxDecimals: number;
  percent?: boolean;      // Format as percentage
  grouping?: string;      // String for thousand separators
  accounting?: boolean;   // Use parentheses for negative numbers
  exponential?: boolean;  // Use exponential notation
  currency?: string;      // Symbol for currency prefix
}

type FormatFunc = (num: number) => string;

// TODO need separate tests for addGrouping, and core createFormatFunc; should find assorted test
// cases for it.
// Add benchmarks comparing to Intl and numeraljs.
export function createFormatFunc(options: FormatOptions): FormatFunc {
  const {minDecimals, maxDecimals, grouping, currency} = options;
  if (options.exponential) {
    return (num: number) => num.toExponential(maxDecimals);
  }
  let func: FormatFunc;
  if (grouping) {
    func = (num: number) => addGrouping(toFixed(num, minDecimals, maxDecimals), grouping);
  } else {
    func = (num: number) => toFixed(num, minDecimals, maxDecimals);
  }
  if (options.accounting) {
    const func1 = func;
    func = (num: number) => num < 0 ? `(${func1(-num)})` : func1(num);
  }
  if (options.percent) {
    const func1 = func;
    func = (num: number) => func1(num * 100) + '%';
  } else if (options.currency) {
    const func1 = func;
    if (options.accounting) {
      func = (num: number) => currency + func1(num);
    } else {
      func = (num: number) => num < 0 ? '-' + currency + func1(-num) : currency + func1(num);
    }
  }
  return func;
}

/**
 * Add thousands separators to the input number, which should be in the format /-?\d*(.\d*)?/
 * (e.g. as returned by toFixed).
 */
export function addGrouping(input: string, sep: string = ','): string {
  let decimalDot = input.indexOf('.');
  let start = input[0] === '-' ? 1 : 0;
  let end = decimalDot < 0 ? input.length : decimalDot;
  let digits = end - start;
  let firstGroup = (digits + 2) % 3 + 1;    // Mod 3, but returning a value between 1 and 3.
  let p = start + firstGroup;
  let res = input.slice(0, p);
  for ( ; p < end; p += 3) {
    res += sep + input.slice(p, p + 3);
  }
  res += input.slice(p);
  return res;
}
