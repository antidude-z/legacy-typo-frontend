import test from 'node:test';
import assert from 'node:assert/strict';
import { payerRoute, billRoute, paymentRoute, paymentEditorPath } from '../src/accountingRoutes.js';

test('payer lifecycle routes retain legacy URLs', () => {
  assert.deepEqual(payerRoute('/accounting/payers'), {identity:null,action:'list'});
  assert.equal(payerRoute('/accounting/payers/create').action,'create');
  assert.deepEqual(payerRoute('/accounting/payers/7/delete'), {identity:'7',action:'delete'});
  assert.equal(payerRoute('/accounting/payers/7/restore').action,'restore');
  assert.equal(payerRoute('/accounting/payers/create/edit'),null);
  assert.equal(payerRoute('/accounting/bills'),null);
});

test('bill view and edit remain distinct', () => {
  assert.deepEqual(billRoute('/accounting/bills/7'),{identity:'7',action:'view'});
  assert.equal(billRoute('/accounting/bills/7/edit').action,'edit');
  assert.equal(billRoute('/accounting/bills/create').action,'create');
  assert.equal(billRoute('/accounting/bills/create/edit'),null);
  assert.equal(billRoute('/accounting/bills/7/payments/create'),null);
});

test('payment routes preserve parent bill and save-navigation paths', () => {
  assert.deepEqual(paymentRoute('/accounting/bills/7/payments/4/edit'),{billId:'7',identity:'4',action:'edit'});
  assert.equal(paymentRoute('/accounting/bills/7/payments/create').action,'create');
  assert.equal(paymentRoute('/accounting/bills/7/payments/4/restore').action,'restore');
  assert.equal(paymentRoute('/accounting/bills/7/payments/create/edit'),null);
  assert.equal(paymentEditorPath(7),' /accounting/bills/7/payments/create'.trim());
  assert.equal(paymentEditorPath(7,4),'/accounting/bills/7/payments/4/edit');
  assert.throws(() => paymentEditorPath('../bad'));
});