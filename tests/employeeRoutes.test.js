import test from 'node:test';
import assert from 'node:assert/strict';
import { employeeRoute } from '../src/employeeRoutes.js';

test('employee routes handle new, edit, confirmation and restore', () => {
  assert.deepEqual(employeeRoute('/references/users'), {identity:null, action:'list'});
  assert.deepEqual(employeeRoute('/references/users/create'), {identity:null, action:'create'});
  assert.deepEqual(employeeRoute('/references/users/4'), {identity:'4', action:'show'});
  assert.equal(employeeRoute('/references/users/4/edit').action, 'edit');
  assert.equal(employeeRoute('/references/users/4/delete').action, 'delete');
  assert.equal(employeeRoute('/references/users/4/restore').action, 'restore');
  assert.equal(employeeRoute('/references/users/create/edit'), null);
});