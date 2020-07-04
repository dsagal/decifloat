import {assert} from 'chai';
import * as decifloat from '../lib';
import * as numeral from 'numeral';

function timeIt<T>(count: number, func: () => T) {
  const start = Date.now();
  let result!: T;
  for (let i = 0; i < count; i++) {
    result = func();
  }
  const time = Date.now() - start;
  return {time, result};
}

function pad(val: string, padding: number) {
  return padding < 0 ? (val as any).padStart(-padding) : (val as any).padEnd(padding);
}

function report(text: string) {
  console.log(text);
  if (typeof document !== 'undefined') {
    document.getElementById('output')!.textContent += text + '\n';
  }
}

function main() {
  const numbers = [1.000000005, -123456.79, 6.15e-7];
  const useDecifloat = (val: number) => decifloat.toFixed(val, 1, 8);
  const useToFixed = (val: number) => val.toFixed(8);
  const fmt = '0.0[0000000]';
  const useNumeral = (val: number) => numeral(val).format(fmt);
  const numberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 8, useGrouping: false});
  const useNumberFormat = (val: number) => numberFormat.format(val);

  for (const func of [useDecifloat, useToFixed, useNumeral, useNumberFormat]) {
    const code = String(func).split("=>")[1].trim();
    const results = numbers.map((v) => func(v));
    const N = 100000;
    let i = 0;
    const {time, result} = timeIt(N, () => func(numbers[i++ % 3]));
    assert.equal(result, results[(N - 1) % 3]);
    report(`${pad(code, 40)} | ${results.map(x => pad(x, -20)).join(" | " )} | ${(time / N * 1000).toFixed(2)} us`);
  }
}

main();
