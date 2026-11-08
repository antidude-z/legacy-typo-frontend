import test from 'node:test';
import assert from 'node:assert/strict';
import { payerRoute } from '../src/accountingRoutes.js';

test('payer lifecycle routes retain legacy URLs', () => {
  assert.deepEqual(payerRoute('/accounting/payers'), {identity:null,action:'list'});
  assert.equal(payerRoute('/accounting/payers/create').action,'create');
  assert.deepEqual(payerRoute('/accounting/payers/7/delete'), {identity:'7',action:'delete'});
  assert.equal(payerRoute('/accounting/payers/7/restore').action,'restore');
  assert.equal(payerRoute('/accounting/payers/create/edit'),null);
  assert.equal(payerRoute('/accounting/bills'),null);
});