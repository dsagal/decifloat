import {assert} from 'chai';
import {toFixed} from '../lib/index';
import {addGrouping} from '../lib/format';

describe('format', () => {
  describe('addGrouping', function() {
    it('should add thousand separators correctly', function() {
      assert.equal(addGrouping(''), '');
      assert.equal(addGrouping('0'), '0');
      assert.equal(addGrouping('10'), '10');
      assert.equal(addGrouping('100'), '100');
      assert.equal(addGrouping('1000'), '1,000');
      assert.equal(addGrouping('1234'), '1,234');
      assert.equal(addGrouping('12345'), '12,345');
      assert.equal(addGrouping('123456'), '123,456');
      assert.equal(addGrouping('1234567'), '1,234,567');

      // Same as above, with a minus sign.
      assert.equal(addGrouping('-0'), '-0');
      assert.equal(addGrouping('-10'), '-10');
      assert.equal(addGrouping('-100'), '-100');
      assert.equal(addGrouping('-1000'), '-1,000');
      assert.equal(addGrouping('-1234'), '-1,234');
      assert.equal(addGrouping('-12345'), '-12,345');
      assert.equal(addGrouping('-123456'), '-123,456');
      assert.equal(addGrouping('-1234567'), '-1,234,567');

      // Same as above, with decimals, assorted minus signs.
      assert.equal(addGrouping('-0.1234567'), '-0.1234567');
      assert.equal(addGrouping('.1234567'), '.1234567');
      assert.equal(addGrouping('-.1234567'), '-.1234567');
      assert.equal(addGrouping('-10.1234567'), '-10.1234567');
      assert.equal(addGrouping('100.1234567'), '100.1234567');
      assert.equal(addGrouping('-1000.1234567'), '-1,000.1234567');
      assert.equal(addGrouping('1234.1234567'), '1,234.1234567');
      assert.equal(addGrouping('-12345.1234567'), '-12,345.1234567');
      assert.equal(addGrouping('123456.1234567'), '123,456.1234567');
      assert.equal(addGrouping('-1234567.1234567'), '-1,234,567.1234567');

      // Very large numbers
      assert.equal(addGrouping(toFixed(6.0015e20, 0, 20)), '600,150,000,000,000,000,000');
    });

    it('should support custom separators', function() {
      assert.equal(addGrouping(toFixed(6.0015e20, 0, 20), "'"), "600'150'000'000'000'000'000");
      assert.equal(addGrouping(toFixed(6.0015e20, 0, 20), " "), "600 150 000 000 000 000 000");
      assert.equal(addGrouping('-1234567.1234567', ' '), '-1 234 567.1234567');
    });
  });
});
