import test from 'node:test';
import assert from 'node:assert/strict';
import { payrollRoute } from '../src/payrollRoutes.js';

test('payroll routes preserve legacy create/edit paths', () => {
  assert.deepEqual(payrollRoute('/reports/payrolls'), {identity:null,action:'create'});
  assert.deepEqual(payrollRoute('/reports/payrolls/create'), {identity:null,action:'create'});
  assert.deepEqual(payrollRoute('/reports/payrolls/12'), {identity:'12',action:'edit'});
  assert.deepEqual(payrollRoute('/reports/payrolls/12/edit'), {identity:'12',action:'edit'});
  assert.equal(payrollRoute('/reports/payrolls/create/edit'), null);
});