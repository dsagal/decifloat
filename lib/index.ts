/**
 * Represents a floating-point number as mantissa (or significand) and a power-of-10 exponent, as
 * calculated by the native number.toExponent() method.
 */
export class DeciFloat {
  // Note that we keep mantissa as a string for speed, because we don't need to parse it.
  public mantissa!: string;           // unchanged value for values like NaN and Infinity.
  public exp!: number;                // power of 10
  public num!: number;                // only used for values like NaN and Infinity.

  constructor(num: number) {
    this.reset(num);
  }

  /**
   * Multiply the value in-place by the given power of 10, which must be an integer.
   */
  public scale(powerOf10: number): void {
    this.exp += powerOf10;
  }

  /**
   * Replace the stored value with a different one.
   */
  public reset(num: number): void {
    this.num = num;
    const str = num.toString();
    const expIndex = str.indexOf('e');
    this.mantissa = expIndex < 0 ? str : str.slice(0, expIndex);
    this.exp = expIndex < 0 ? 0 : parseInt(str.slice(expIndex + 1), 10);
  }

  /**
   * Returns the stored value as a regular number.
   */
  public value(): number {
    return isFinite(this.num) ? parseFloat(this.mantissa + 'e' + this.exp) : this.num;
  }

  /**
   * Returns the number of significant decimal digits after the decimal point. If the number is an
   * integer ending in zeroes, then returns a negative number for zeroes before the decimal point.
   */
  public usefulDecimals(): number {
    const dotIndex = this.mantissa.indexOf('.');
    if (dotIndex < 0) {
      let last = this.mantissa.length - 1;
      while (last > 0 && this.mantissa[last] === '0') {
        --last;
      }
      return last + 1 - this.mantissa.length - this.exp;
    } else {
      return this.mantissa.length - dotIndex - 1 - this.exp;
    }
  }

  /**
   * Round a number to the given number of decimals. E.g. round(1.45, 1) is 1.5, while round(150, -2) is 200.
   */
  public round(decimals: number, roundingFunc = Math.round): void {
    if (this.usefulDecimals() > decimals) {
      this.scale(decimals);
      const value = roundingFunc(this.value());
      this.reset(value);
      if (value !== 0) {
        this.scale(-decimals);
      }
    }
  }
}

/**
 * Returns formatted number with at least minDec and at most maxDec decimal digits after the decimal point.
 */
export function toFixed(num: number, minDec: number, maxDec: number, roundingFunc = Math.round): string {
  const df = new DeciFloat(num);
  df.round(maxDec, roundingFunc);
  return df.value().toFixed(Math.max(df.usefulDecimals(), minDec));
}
