import test from 'node:test';
import assert from 'node:assert/strict';
import { compileRoute } from '../src/compileRoutes.js';

test('compilation create and nested lifecycle URLs', () => {
  assert.equal(compileRoute('/references/compiles/create').level, 'definition');
  assert.equal(compileRoute('/references/compiles/3/delete').action, 'delete');
  assert.deepEqual(compileRoute('/references/compiles/3/stages/4/materials/5/edit'), {
    identity:'3', stageId:'4', itemId:'5', level:'material', action:'edit'
  });
  assert.equal(compileRoute('/references/compiles/create/edit'), null);
  assert.equal(compileRoute('/references/compiles/3/stages/create/materials/create'), null);
});