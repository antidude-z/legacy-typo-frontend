import test from 'node:test';
import assert from 'node:assert/strict';
import { payerRoute, billRoute, paymentRoute, paymentEditorPath } from '../src/accountingRoutes.js';
import { safeDestination, orderEditPath, billLabel } from '../src/navigation.js';

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

test('accounting/order destinations stay same-origin and bill labels are stable', () => {
  assert.equal(safeDestination('/accounting/bills?page=2', '/orders', 'http://app'), '/accounting/bills?page=2');
  assert.equal(safeDestination('https://evil.example', '/orders', 'http://app'), '/orders');
  assert.equal(safeDestination('/javascript%2Falert', '/orders', 'http://app'), '/orders');
  assert.equal(orderEditPath(4, '/accounting/bills?page=1'), '/orders/4?destination=%2Faccounting%2Fbills%3Fpage%3D1');
  assert.equal(billLabel({number:'A-1',date:'2024-01-02'}), 'A-1 от 02.01.2024 г.');
  assert.equal(billLabel(null), ' - Не выбран - ');
});