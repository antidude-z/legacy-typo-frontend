import test from 'node:test';
import assert from 'node:assert/strict';
import { printerChildRoute } from '../src/printerRoutes.js';

test('nested printer URLs keep each parent identity', () => {
  assert.deepEqual(printerChildRoute('/references/printers/4/processes/12/stages/9/edit'), {
    printerId:'4', processId:'12', kind:'stages', identity:'9', action:'edit'
  });
  assert.equal(printerChildRoute('/references/printers/4/fields/create').action, 'create');
  assert.equal(printerChildRoute('/references/printers/4/processes').action, 'list');
  assert.equal(printerChildRoute('/references/printers/4/processes/create/edit'), null);
  assert.equal(printerChildRoute('/references/printers/4'), null);
});