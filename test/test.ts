import {assert} from 'chai';
import {DeciFloat, toFixed} from '../lib';

describe('DeciFloat', () => {
  describe('constructor', () => {
    it('should extract whole part and decimal exponent', () => {
      function parse(num: number) { return {...new DeciFloat(num)}; }
      assert.deepEqual(parse(0.67), {num: 0.67, mantissa: '6.7', exp: -1});
      assert.deepEqual(parse(-0.67), {num: -0.67, mantissa: '-6.7', exp: -1});
      assert.deepEqual(parse(0.0000000067), {num: 0.0000000067, mantissa: '6.7', exp: -9});
      assert.deepEqual(parse(-0.0000000067), {num: -0.0000000067, mantissa: '-6.7', exp: -9});
      assert.deepEqual(parse(1234567890), {num: 1234567890, mantissa: '1.23456789', exp: 9});
      assert.deepEqual(parse(-1234567890), {num: -1234567890, mantissa: '-1.23456789', exp: 9});
      assert.deepEqual(parse(0), {num: 0, mantissa: '0', exp: 0});
      assert.deepEqual(parse(1), {num: 1, mantissa: '1', exp: 0});
      assert.deepEqual(parse(-1), {num: -1, mantissa: '-1', exp: 0});
      assert.deepEqual(parse(9), {num: 9, mantissa: '9', exp: 0});
      assert.deepEqual(parse(0.0009), {num: 0.0009, mantissa: '9', exp: -4});
      assert.deepEqual(parse(9000), {num: 9000, mantissa: '9', exp: 3});
      assert.deepEqual(parse(-121e+25), {num: -121e+25, mantissa: '-1.21', exp: 27});
      assert.deepEqual(parse(-121e-25), {num: -121e-25, mantissa: '-1.21', exp: -23});
      assert.deepEqual(parse(NaN), {num: NaN, mantissa: null, exp: NaN});
      assert.deepEqual(parse(Infinity), {num: Infinity, mantissa: null, exp: NaN});
      assert.deepEqual(parse(-Infinity), {num: -Infinity, mantissa: null, exp: NaN});
      const maxSafeInt = 9007199254740991, minSafeInt = -9007199254740991;
      assert.deepEqual(parse(maxSafeInt), {num: maxSafeInt, mantissa: '9.007199254740991', exp: 15});
      assert.deepEqual(parse(minSafeInt), {num: minSafeInt, mantissa: '-9.007199254740991', exp: 15});
    });
  });

  describe('usefulDecimals', () => {
    it('should return number of meaningful digits after decimal point', () => {
      function decimals(num: number) { return new DeciFloat(num).usefulDecimals(); }
      assert.deepEqual(decimals(0.67), 2);
      assert.deepEqual(decimals(-0.67), 2);
      assert.deepEqual(decimals(0.615), 3);
      assert.deepEqual(decimals(1.005), 3);
      assert.deepEqual(decimals(0.0000000067), 10);
      assert.deepEqual(decimals(-0.0000000067), 10);
      assert.deepEqual(decimals(1234567890), -1);
      assert.deepEqual(decimals(-1234567890), -1);
      assert.deepEqual(decimals(0), 0);
      assert.deepEqual(decimals(1), 0);
      assert.deepEqual(decimals(-1), 0);
      assert.deepEqual(decimals(9), 0);
      assert.deepEqual(decimals(0.0009), 4);
      assert.deepEqual(decimals(9000), -3);
      assert.deepEqual(decimals(-121e+25), -25);
      assert.deepEqual(decimals(-121e-25), 25);
      assert.deepEqual(decimals(NaN), 0);
      assert.deepEqual(decimals(Infinity), 0);
      assert.deepEqual(decimals(-Infinity), 0);
      const maxSafeInt = 9007199254740991, minSafeInt = -9007199254740991;
      assert.deepEqual(decimals(maxSafeInt), 0);
      assert.deepEqual(decimals(minSafeInt), 0);
    });
  });

  describe('round', () => {
    it('should round to given power of 10', () => {
      function round(num: number, prec: number) {
        const df = new DeciFloat(num);
        df.round(prec);
        return df.value();
      }
      assert.deepEqual(round(0.615, 3), 0.615);
      assert.deepEqual(round(0.615, 2), 0.62);
      assert.deepEqual(round(0.615, 1), 0.6);
      assert.deepEqual(round(0.615, 0), 1);
      assert.deepEqual(round(0.615, -1), 0);
      assert.deepEqual(round(0.615, -2), 0);
      assert.deepEqual(round(0.61499999, 3), 0.615);
      assert.deepEqual(round(0.00000000067, 8),  0.0);
      assert.deepEqual(round(0.00000000067, 9),  0.000000001);
      assert.deepEqual(round(0.00000000067, 10), 0.0000000007);
      assert.deepEqual(round(0.00000000067, 11), 0.00000000067);
      assert.deepEqual(round(0.00000000067, 12), 0.00000000067);
      assert.deepEqual(round(1.005, 3), 1.005);
      assert.deepEqual(round(1.005, 2), 1.01);
      assert.deepEqual(round(1.005, 1), 1);
      assert.deepEqual(round(1.005, 0), 1);
      assert.deepEqual(round(100.5, 1), 100.5);
      assert.deepEqual(round(100.5, 0), 101);
      // 1.005 is actually 1.004999..., which becomes visible in rounding when multiplied by 100.
      assert.deepEqual(round((1.005*100), 1), 100.5);
      assert.deepEqual(round((1.005*100), 0), 100);
    });
  });

  describe('toFixed', () => {
    it('should respect min/maxDecimals and round correctly', () => {
      // Test cases from numeral.js
      assert.strictEqual(toFixed(0, 0, 0),              '0');
      assert.strictEqual(toFixed(0, 2, 2),              '0.00');
      assert.strictEqual(toFixed(NaN, 1, 1),            'NaN');
      assert.strictEqual(toFixed(Infinity, 1, 1),       'Infinity');
      assert.strictEqual(toFixed(-Infinity, 1, 1),      '-Infinity');
      assert.strictEqual(toFixed(1.23, 0, 0),           '1');
      assert.strictEqual(toFixed(10000, 4, 4),          '10000.0000');
      assert.strictEqual(toFixed(10000.23, 0, 0),       '10000');
      assert.strictEqual(toFixed(-10000, 1, 1),         '-10000.0');
      assert.strictEqual(toFixed(10000.1234, 3, 3),     '10000.123');
      assert.strictEqual(toFixed(10000, 0, 2),          '10000');
      assert.strictEqual(toFixed(10000.1, 2, 2),        '10000.10');
      assert.strictEqual(toFixed(10000.123, 0, 2),      '10000.12');
      assert.strictEqual(toFixed(10000.456, 0, 2),      '10000.46');
      assert.strictEqual(toFixed(10000.001, 0, 2),      '10000');
      assert.strictEqual(toFixed(10000.45, 2, 3),       '10000.45');
      assert.strictEqual(toFixed(10000.456, 2, 3),      '10000.456');
      assert.strictEqual(toFixed(10000, 4, 4),          '10000.0000');
      assert.strictEqual(toFixed(-10000, 4, 4),         '-10000.0000');
      assert.strictEqual(toFixed(-12300, 4, 4),         '-12300.0000');
      assert.strictEqual(toFixed(1230, 0, 0),           '1230');
      assert.strictEqual(toFixed(-1230, 0, 0),          '-1230');
      assert.strictEqual(toFixed(-1230.4, 1, 1),        '-1230.4');
      assert.strictEqual(toFixed(1230.4, 1, 1),         '1230.4');
      assert.strictEqual(toFixed(100.78, 0, 0),         '101');
      assert.strictEqual(toFixed(100.28, 0, 0),         '100');
      assert.strictEqual(toFixed(1.932, 1, 1),          '1.9');
      assert.strictEqual(toFixed(1.9687, 0, 0),         '2');
      assert.strictEqual(toFixed(1.9687, 1, 1),         '2.0');
      assert.strictEqual(toFixed(-0.23, 2, 2),          '-0.23');
      assert.strictEqual(toFixed(0.615, 2, 2),          '0.62');
      assert.strictEqual(toFixed(0.23, 5, 5),           '0.23000');
      assert.strictEqual(toFixed(0.67, 1, 5),           '0.67');
      assert.strictEqual(toFixed(0.0067, 1, 8),         '0.0067');
      assert.strictEqual(toFixed(0.000067, 1, 8),       '0.000067');
      assert.strictEqual(toFixed(0.00000067, 1, 8),     '0.00000067');
      assert.strictEqual(toFixed(0.000000067, 1, 8),    '0.00000007');
      assert.strictEqual(toFixed(0.0000000067, 1, 8),   '0.00000001');
      assert.strictEqual(toFixed(0.00000000067, 1, 8),  '0.0');
      assert.strictEqual(toFixed(3162.63, 1, 15),       '3162.63');
      assert.strictEqual(toFixed(1.99, 0, 1),           '2');
      assert.strictEqual(toFixed(1.0501, 2, 3),         '1.05');
      assert.strictEqual(toFixed(1.005, 2, 2),          '1.01');
      assert.strictEqual(toFixed(.0000001, 0, 0),       '0');
      assert.strictEqual(toFixed(.000001, 0, 0),        '0');
      assert.strictEqual(toFixed(.0000005, 0, 0),       '0');
      assert.strictEqual(toFixed(.0000009, 0, 0),       '0');
      assert.strictEqual(toFixed(.0000010, 0, 0),       '0');
      assert.strictEqual(toFixed(.0000015, 0, 0),       '0');

      // Test cases from some other random library.
      assert.strictEqual(toFixed(0.099999,   3, 3), '0.100');
      assert.strictEqual(toFixed(0.999999,   3, 3), '1.000');
      assert.strictEqual(toFixed(0.09,       2, 2), '0.09');
      assert.strictEqual(toFixed(0.09,       1, 1), '0.1');
      assert.strictEqual(toFixed(0.09,       5, 5), '0.09000');
      assert.strictEqual(toFixed(0.09,       0, 0), '0');
      assert.strictEqual(toFixed(0.99,       3, 3), '0.990');
      assert.strictEqual(toFixed(0.99,       1, 1), '1.0');
      assert.strictEqual(toFixed(.99,        3, 3), '0.990');
      assert.strictEqual(toFixed(1.099999,   3, 3), '1.100');
      assert.strictEqual(toFixed(1.999999,   3, 3), '2.000');
      assert.strictEqual(toFixed(1.09,       2, 2), '1.09');
      assert.strictEqual(toFixed(1.09,       1, 1), '1.1');
      assert.strictEqual(toFixed(1.09,       5, 5), '1.09000');
      assert.strictEqual(toFixed(9.09,       0, 0), '9');
      assert.strictEqual(toFixed(9.99,       3, 3), '9.990');
      assert.strictEqual(toFixed(9.99,       1, 1), '10.0');
      assert.strictEqual(toFixed(199.9999,   3, 3), '200.000');

      // Other assorted test cases.
      assert.strictEqual(toFixed(8.04,        16, 16), '8.0399999999999991');
      assert.strictEqual(toFixed(8.04,        17, 17), '8.03999999999999915');
      assert.strictEqual(toFixed(8.04,         0, 16), '8.04');
      assert.strictEqual(toFixed(8.04,         0, 17), '8.04');
      assert.strictEqual(toFixed(8.04,        10, 16), '8.0400000000');
      assert.strictEqual(toFixed(8.04,        10, 17), '8.0400000000');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 17), '-0.00000000000000022');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 16), '-0.0000000000000002');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 15), '0');
    });

    function timeIt<T>(count: number, func: () => T) {
      const start = Date.now();
      let result!: T;
      for (let i = 0; i < count; i++) {
        result = func();
      }
      const time = Date.now() - start;
      return {time, result};
    }

    it('should be reasonably fast', () => {
      // We measure speed by comparing to the speed of the native toFixed() method.
      const ref = timeIt(100000, () => (1.005).toFixed(2));
      assert.strictEqual(ref.result, '1.00');   // (Such rounding is why native toFixed() isn't sufficient)

      const test1 = timeIt(100000, () => toFixed(1.005, 1, 5));
      assert.strictEqual(test1.result, '1.005');
      const test2 = timeIt(100000, () => toFixed(1.005, 5, 5));
      assert.strictEqual(test2.result, '1.00500');
      const test3 = timeIt(100000, () => toFixed(1.005, 0, 2));
      assert.strictEqual(test3.result, '1.01');
      const test4 = timeIt(100000, () => toFixed(1.005, 0, 1));
      assert.strictEqual(test4.result, '1');

      // It takes about 4 times longer than native when rounding is needed, and about 3 times when not.
      // Note that this test is very likely to be flaky.
      assert.closeTo(test1.time, ref.time * 3, ref.time);
      assert.closeTo(test2.time, ref.time * 3, ref.time);
      assert.closeTo(test3.time, ref.time * 4, ref.time);
      assert.closeTo(test4.time, ref.time * 4, ref.time);
    });
  });
});
