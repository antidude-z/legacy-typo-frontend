import test from 'node:test';
import assert from 'node:assert/strict';
import { afterprintRoute } from '../src/afterprintRoutes.js';

test('afterprint hierarchy preserves stage/material parents', () => {
  assert.deepEqual(afterprintRoute('/references/afterprints/2/stages/3/materials/4/edit'), {
    identity:'2', stageId:'3', itemId:'4', level:'material', action:'edit'
  });
  assert.equal(afterprintRoute('/references/afterprints/2/stages/create').action, 'create');
  assert.equal(afterprintRoute('/references/afterprints/2/stages/3/materials/create').level, 'material');
  assert.equal(afterprintRoute('/references/afterprints/2/delete'), null);
  assert.equal(afterprintRoute('/references/afterprints/create'), null);
  assert.equal(afterprintRoute('/references/afterprints/2/stages/create/edit'), null);
});