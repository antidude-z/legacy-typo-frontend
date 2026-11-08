import test from 'node:test';
import assert from 'node:assert/strict';
import { permissionRoute } from '../src/permissionRoutes.js';

test('permissions route matches only the legacy administration path', () => {
  assert.deepEqual(permissionRoute('/options/permissions'), { action: 'edit' });
  assert.deepEqual(permissionRoute('/options/permissions/'), { action: 'edit' });
  assert.equal(permissionRoute('/options/permissions/1'), null);
});