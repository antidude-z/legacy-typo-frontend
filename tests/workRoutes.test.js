import test from 'node:test';
import assert from 'node:assert/strict';
import { workRoute } from '../src/workRoutes.js';

test('work routes preserve reference ids and actions', () => {
  assert.deepEqual(workRoute('/references/prepresses/4/edit'), {kind:'prepresses', identity:'4', action:'edit'});
  assert.deepEqual(workRoute('/references/redactions/create'), {kind:'redactions', identity:null, action:'create'});
  assert.equal(workRoute('/references/prepresses/create/edit'), null);
});