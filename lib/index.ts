interface ParsedNumberFinite {
  isFinite: true;
  num: number;
  mantissa: string;    // String part of the number until exponent.
  exp: number;         // Decimal exponent for finite numbers.
}

interface ParsedNumberNonFinite {
  isFinite: false;
  num: number;
}

type ParsedNumber = ParsedNumberFinite | ParsedNumberNonFinite;

export function parseNumber(num: number): ParsedNumber {
  if (!isFinite(num)) {
    return {isFinite: false, num};
  } else {
    const str = num.toString();
    const expIndex = str.indexOf('e');
    const mantissa = expIndex < 0 ? str : str.slice(0, expIndex);
    const exp = expIndex < 0 ? 0 : parseInt(str.slice(expIndex + 1), 10);
    return {isFinite: true, num, mantissa, exp};
  }
}

/**
 * Returns the number of significant decimal digits after the decimal point. Always >= 0.
 */
export function usefulDecimals(parsed: ParsedNumber): number {
  if (!parsed.isFinite) { return 0; }
  const dotIndex = parsed.mantissa.indexOf('.');
  if (dotIndex < 0) {
    return (parsed.exp >= 0) ? 0 : -parsed.exp - countTrailingZeroes(parsed.mantissa, -parsed.exp);
  } else {
    return Math.max(0, parsed.mantissa.length - dotIndex - 1 - parsed.exp);
  }
}

/**
 * Round a number to a given number of decimals after the point. E.g. round(1.45, 1) is 1.5.
 */
export function round(parsed: ParsedNumber, decimals: number, roundingFunc = Math.round): number {
  if (!parsed.isFinite || usefulDecimals(parsed) <= decimals) { return parsed.num; }
  const scaled = parseFloat(parsed.mantissa + 'e' + (parsed.exp + decimals));
  return roundingFunc(scaled) / Math.pow(10, decimals);
}

export function countTrailingZeroes(str: string, maxZeroes: number = str.length): number {
  const stop = str.length - maxZeroes;
  let i = str.length - 1;
  while (i >= stop && str[i] === '0') { --i; }
  return str.length - 1 - i;
}

export function stripTrailingZeroes(str: string, maxToStrip: number) {
  const stripCount = countTrailingZeroes(str, maxToStrip);
  return str.slice(0, str.length - stripCount);
}

/**
 * Returns formatted number with at least minDec and at most maxDec decimal digits after the decimal point.
 */
export function toFixed(num: number, minDec: number, maxDec: number, roundingFunc = Math.round): string {
  let parsed = parseNumber(num);
  if (usefulDecimals(parsed) > maxDec) {
    const rounded = round(parsed, maxDec, roundingFunc);
    parsed = parseNumber(rounded);
  }
  if (!parsed.isFinite) { return parsed.num.toString(); }
  if (parsed.exp === 0) {
    // It's much faster to tack on zeroes than to call toFixed() again.
    const zeroes = minDec - usefulDecimals(parsed);
    if (zeroes > 0) {
      const needDot = (parsed.mantissa.indexOf('.') < 0);
      return parsed.mantissa + (needDot ? '.' : '') + '0'.repeat(zeroes);
    } else {
      return parsed.mantissa;
    }
  }
  return parsed.num.toFixed(Math.max(minDec, usefulDecimals(parsed)));
}
