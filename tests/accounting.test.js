import test from 'node:test';
import assert from 'node:assert/strict';
import { money, billEditPath } from '../src/accounting.js';
import { safeDestination } from '../src/navigation.js';

test('accounting display uses two decimal places and grouped thousands', () => {
  assert.equal(money('12345.50'), '12 345.50');
  assert.equal(money(0), '0.00');
  assert.equal(money('-10.25'), '-10.25');
  assert.equal(money('invalid'), '—');
});
test('view-to-edit preserves a safe return destination', () => {
  assert.equal(billEditPath(4, '/accounting/bills?page=2'), '/accounting/bills/4/edit?destination=%2Faccounting%2Fbills%3Fpage%3D2');
  assert.throws(() => billEditPath('../evil', '/orders'));
  assert.equal(safeDestination('http://user:pass@app/orders', '/orders', 'http://app'), '/orders');
  assert.equal(safeDestination('//evil/orders', '/orders', 'http://app'), '/orders');
});