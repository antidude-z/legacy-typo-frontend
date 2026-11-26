import test from 'node:test';
import assert from 'node:assert/strict';
import { canEditPayroll } from '../src/payrollCapabilities.js';

test('payroll editing fails closed and follows server capability and paid state', () => {
  assert.equal(canEditPayroll(undefined), false);
  assert.equal(canEditPayroll({ item: { status: 'calc' } }), false);
  assert.equal(canEditPayroll({ can_edit: false, item: { status: 'calc' } }), false);
  assert.equal(canEditPayroll({ can_edit: true, item: { status: 'paid' } }), false);
  assert.equal(canEditPayroll({ can_edit: true, item: { status: 'calc' } }), true);
  assert.equal(canEditPayroll({ can_edit: true }), true);
});