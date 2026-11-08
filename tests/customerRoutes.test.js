import test from 'node:test';
import assert from 'node:assert/strict';
import { customerRoute } from '../src/customerRoutes.js';

test('customer create and lifecycle URLs', () => {
  assert.deepEqual(customerRoute('/references/customers/23/edit'), {identity:'23', action:'edit'});
  assert.equal(customerRoute('/references/customers/create').action, 'create');
  assert.equal(customerRoute('/references/customers/23/restore').action, 'restore');
  assert.equal(customerRoute('/references/customers/create/edit'), null);
  assert.equal(customerRoute('/references/customers/23/contacts'), null);
});