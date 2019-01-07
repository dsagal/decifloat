import {assert} from 'chai';
import {parseNumber, usefulDecimals, round, toFixed} from '../lib';

describe('decifloat', () => {
  const p = parseNumber;

  describe('parseNumber', () => {
    it('should extract whole part and decimal exponent', () => {
      assert.deepEqual(parseNumber(0.67), {isFinite: true, num: 0.67, mantissa: '0.67', exp: 0});
      assert.deepEqual(parseNumber(-0.67), {isFinite: true, num: -0.67, mantissa: '-0.67', exp: 0});
      assert.deepEqual(parseNumber(0.0000000067), {isFinite: true, num: 0.0000000067, mantissa: '6.7', exp: -9});
      assert.deepEqual(parseNumber(-0.0000000067), {isFinite: true, num: -0.0000000067, mantissa: '-6.7', exp: -9});
      assert.deepEqual(parseNumber(1234567890), {isFinite: true, num: 1234567890, mantissa: '1234567890', exp: 0});
      assert.deepEqual(parseNumber(-1234567890), {isFinite: true, num: -1234567890, mantissa: '-1234567890', exp: 0});
      assert.deepEqual(parseNumber(0), {isFinite: true, num: 0, mantissa: '0', exp: 0});
      assert.deepEqual(parseNumber(1), {isFinite: true, num: 1, mantissa: '1', exp: 0});
      assert.deepEqual(parseNumber(-1), {isFinite: true, num: -1, mantissa: '-1', exp: 0});
      assert.deepEqual(parseNumber(9), {isFinite: true, num: 9, mantissa: '9', exp: 0});
      assert.deepEqual(parseNumber(0.0009), {isFinite: true, num: 0.0009, mantissa: '0.0009', exp: 0});
      assert.deepEqual(parseNumber(9000), {isFinite: true, num: 9000, mantissa: '9000', exp: 0});
      assert.deepEqual(parseNumber(-121e+25), {isFinite: true, num: -121e+25, mantissa: '-1.21', exp: 27});
      assert.deepEqual(parseNumber(-121e-25), {isFinite: true, num: -121e-25, mantissa: '-1.21', exp: -23});
      assert.deepEqual(parseNumber(NaN), {isFinite: false, num: NaN});
      assert.deepEqual(parseNumber(Infinity), {isFinite: false, num: Infinity});
      assert.deepEqual(parseNumber(-Infinity), {isFinite: false, num: -Infinity});
      const maxSafeInt = 9007199254740991, minSafeInt = -9007199254740991;
      assert.deepEqual(parseNumber(maxSafeInt), {isFinite: true, num: maxSafeInt, mantissa: '9007199254740991', exp: 0});
      assert.deepEqual(parseNumber(minSafeInt), {isFinite: true, num: minSafeInt, mantissa: '-9007199254740991', exp: 0});
    });
  });

  describe('usefulDecimals', () => {
    it('should return number of meaningful digits after decimal point', () => {
      assert.strictEqual(usefulDecimals(p(0)), 0);
      assert.strictEqual(usefulDecimals(p(0.67)), 2);
      assert.strictEqual(usefulDecimals(p(-0.67)), 2);
      assert.strictEqual(usefulDecimals(p(0.615000)), 3);
      assert.strictEqual(usefulDecimals(p(1.005)), 3);
      assert.strictEqual(usefulDecimals(p(0.0000000067)), 10);
      assert.strictEqual(usefulDecimals(p(-0.0000000067)), 10);
      assert.strictEqual(usefulDecimals(p(1234567890)), 0);
      assert.strictEqual(usefulDecimals(p(-1234567890)), 0);
      assert.strictEqual(usefulDecimals(p(0)), 0);
      assert.strictEqual(usefulDecimals(p(1)), 0);
      assert.strictEqual(usefulDecimals(p(-1)), 0);
      assert.strictEqual(usefulDecimals(p(9)), 0);
      assert.strictEqual(usefulDecimals(p(0.0009)), 4);
      assert.strictEqual(usefulDecimals(p(9000)), 0);
      assert.strictEqual(usefulDecimals(p(9000e-1)), 0);
      assert.strictEqual(usefulDecimals(p(9000e-3)), 0);
      assert.strictEqual(usefulDecimals(p(9000e-5)), 2);
      assert.strictEqual(usefulDecimals(p(9000e-25)), 22);
      assert.strictEqual(usefulDecimals(p(7e-8)), 8);
      assert.strictEqual(usefulDecimals(p(-121e+25)), 0);
      assert.strictEqual(usefulDecimals(p(-121e-25)), 25);
      assert.strictEqual(usefulDecimals(p(NaN)), 0);
      assert.strictEqual(usefulDecimals(p(Infinity)), 0);
      assert.strictEqual(usefulDecimals(p(-Infinity)), 0);
      const maxSafeInt = 9007199254740991, minSafeInt = -9007199254740991;
      assert.strictEqual(usefulDecimals(p(maxSafeInt)), 0);
      assert.strictEqual(usefulDecimals(p(minSafeInt)), 0);
    });
  });

  describe('round', () => {
    it('should round a number to a correct number of decimals', () => {
      assert.strictEqual(round(p(1.005), 3), 1.005);
      assert.strictEqual(round(p(1.005), 4), 1.005);
      assert.strictEqual(round(p(1.005), 2), 1.01);
      assert.strictEqual(round(p(1.005), 1), 1);
      assert.strictEqual(round(p(1.005), 0), 1);

      assert.strictEqual(round(p(0.615), 3), 0.615);
      assert.strictEqual(round(p(0.615), 2), 0.62);
      assert.strictEqual(round(p(0.615), 1), 0.6);
      assert.strictEqual(round(p(0.61499999), 3), 0.615);

      assert.strictEqual(round(p(0.615e-12), 15), 0.615e-12);
      assert.strictEqual(round(p(0.615e-12), 14), 0.62e-12);
      assert.strictEqual(round(p(0.615e-12), 13), 0.6e-12);
      assert.strictEqual(round(p(0.615e-12), 12), 1e-12);
      assert.strictEqual(round(p(0.615e-12), 11), 0);
      assert.strictEqual(round(p(0.615e-12), 4), 0);

      assert.strictEqual(round(p(-17e25), 5), -17e25);
      assert.strictEqual(round(p(0.000000067), 8), 0.00000007);
      assert.strictEqual(round(p(0), 3), 0);

      assert.strictEqual(round(p(100.5), 1), 100.5);
      assert.strictEqual(round(p(100.5), 0), 101);
      // 1.005 is actually 1.004999..., which becomes visible in rounding when multiplied by 100.
      assert.strictEqual(round(p((1.005*100)), 1), 100.5);
      assert.strictEqual(round(p((1.005*100)), 0), 100);
    });
  });

  describe('toFixed', () => {
    it('should respect min/maxDecimals and round correctly', () => {
      // Test cases mostly from numeral.js
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
      assert.strictEqual(toFixed(8.04,        16, 16), '8.0400000000000000');
      assert.strictEqual(toFixed(8.04,        17, 17), '8.04000000000000000');
      assert.strictEqual(toFixed(8.04,         0, 16), '8.04');
      assert.strictEqual(toFixed(8.04,         0, 17), '8.04');
      assert.strictEqual(toFixed(8.04,        10, 16), '8.0400000000');
      assert.strictEqual(toFixed(8.04,        10, 17), '8.0400000000');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 17), '-0.00000000000000022');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 16), '-0.0000000000000002');
      assert.strictEqual(toFixed((4/3-1)*3-1,  0, 15), '0');
    });
  });

  describe("timing", () => {
    before(function() {
      if (!process.env.TIMING_TESTS) {
        this.skip();
      }
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

      // It's often faster than native toFixed(), but could be up to twice slower.
      // Note that this test is very likely to be flaky.
      assert.closeTo(test1.time, ref.time, ref.time);
      assert.closeTo(test2.time, ref.time, ref.time);
      assert.closeTo(test3.time, ref.time, ref.time);
      assert.closeTo(test4.time, ref.time, ref.time);
    });

    function report<T>(func: () => T, expected: T) {
      const N = 1000000;
      const res = timeIt(N, func);
      console.log("time %s us ; code %s ; result %s", ((res.time / N) * 1000000).toFixed(3), func, res.result);
      assert.deepEqual(res.result, expected);
    }

    it('informational timings: basic string manipulations', () => {
      const str1 = "helloWorld";
      const str2 = str1.toUpperCase();
      report(() => str1 + "+" + str2, "helloWorld+HELLOWORLD");

      // 13 trailing zeroes
      const c = "1234567890000000000000";
      report(() => countTrailingZeroes(c), 13);
      report(() => c.length - c.search(/0*$/), 13);

      function countTrailingZeroes(str: string, maxZeroes: number = str.length): number {
        const stop = str.length - maxZeroes;
        let i = str.length - 1;
        while (i >= stop && str[i] === '0') { --i; }
        return str.length - 1 - i;
      }

      const d = "123.56700000000";
      report(() => stripTrailingZeroes(d, 6), "123.56700");
      report(() => stripTrailingZeroes(d, 10), "123.567");
      report(() => stripWithNewRE(d, 6), "123.56700");
      report(() => stripWithNewRE(d, 10), "123.567");


      function stripTrailingZeroes(str: string, maxToStrip: number) {
        const stripCount = countTrailingZeroes(str, maxToStrip);
        return str.slice(0, str.length - stripCount);
      }

      function stripWithNewRE(s: string, maxToStrip: number) {
        const optionalsRegExp = new RegExp('\\.?0{1,' + maxToStrip + '}$');
        return s.replace(optionalsRegExp, '');
      }
    });

    it('informational timings: basic string conversions', () => {
      report(() => (1.005).toString(), "1.005");
      report(() => (0.000000000615).toString(), "6.15e-10")
      report(() => (615000000000000000000).toString(), "615000000000000000000");
      report(() => (1.005).toExponential(), "1.005e+0");
      report(() => (0.000000000615).toExponential(), "6.15e-10")
      report(() => (615000000000000000000).toExponential(), "6.15e+20")
      report(() => (1.005).toFixed(5), "1.00500");
      report(() => (0.000000000615).toFixed(5), "0.00000");
      report(() => (615000000000000000000).toFixed(5), "615000000000000000000.00000")
    });

    it('informational timings: toFixed', () => {
      // Example with rounding
      report(() => toFixed(1.005, 2, 2), "1.01");
      // Example with padding with padding with zeroes
      report(() => toFixed(1.005, 5, 5), "1.00500");
      // Example involving exponential-notation toString(), with rounding
      report(() => toFixed(0.0000000000615, 12, 12), "0.000000000062");
      // Example involving exponential-notation toString(), with padding
      report(() => toFixed(0.0000000000615, 15, 15), "0.000000000061500");
      // Example involving a very large number
      report(() => toFixed(615000000000000000000, 0, 0), "615000000000000000000");
      // Example involving a very large number, with padding.
      report(() => toFixed(615000000000000000000, 3, 3), "615000000000000000000.000");
    });

    const df1 = parseNumber(1.005), df2 = parseNumber(1.005 * 100), df3 = parseNumber(-17e25),
          df4 = parseNumber(9000), df5 = parseNumber(170000e-25), df6 = parseNumber(1.123e-25);

    it('informational timings: usefulDecimals', () => {
      report(() => usefulDecimals(df1), 3);
      report(() => usefulDecimals(df2), 14);
      report(() => usefulDecimals(df3), 0);
      report(() => usefulDecimals(df4), 0);
      report(() => usefulDecimals(df5), 21);
      report(() => usefulDecimals(df6), 28);
    });

    it('informational timings: round', () => {
      report(() => round(df1, 3), 1.005);
      report(() => round(df1, 4), 1.005);
      report(() => round(df2, 10), 100.5);
      report(() => round(df3, 5), -17e25);
      report(() => round(df4, 0), 9000);
      report(() => round(df5, 20), 2e-20);
      report(() => round(df6, 27), 1.12e-25);
    });
  });
});
