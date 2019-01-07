// Representation of a finite number as parsed in decimal notation.
interface ParsedNumberFinite {
  isFinite: true;
  num: number;
  mantissa: string;    // String part of the number until exponent.
  exp: number;         // Decimal exponent for finite numbers.
}

// Representation of a non-finite number (NaN, +-Infinity).
interface ParsedNumberNonFinite {
  isFinite: false;
  num: number;
}

// Representation of any number.
type ParsedNumber = ParsedNumberFinite | ParsedNumberNonFinite;

/**
 * Convert a number to its decimal representation by using toString() and parsing.
 */
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
 * Return the number of significant decimal digits after the decimal point. Always >= 0.
 * E.g. usefulDecimals(parsedNumber(0.615000)) is 3.
 */
export function usefulDecimals(parsed: ParsedNumber): number {
  if (!parsed.isFinite) { return 0; }
  const dotIndex = parsed.mantissa.indexOf('.');
  // This relies on mantissa to never include unneeded zeroes, e.g. toString() may return "100" or
  // "1e2", but never "1000e-1".
  const decimals = dotIndex < 0 ? 0 : parsed.mantissa.length - dotIndex - 1;
  return Math.max(0, decimals - parsed.exp);
}

/**
 * Round a number to a given number of decimals after the point. E.g. round(1.45, 1) is 1.5.
 */
export function round(parsed: ParsedNumber, decimals: number, roundingFunc = Math.round): number {
  if (!parsed.isFinite || usefulDecimals(parsed) <= decimals) { return parsed.num; }
  const scaled = parseFloat(parsed.mantissa + 'e' + (parsed.exp + decimals));
  return roundingFunc(scaled) / Math.pow(10, decimals);
}

/**
 * Returns a formatted number with at least minDec and at most maxDec decimal digits after the
 * decimal point.
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
