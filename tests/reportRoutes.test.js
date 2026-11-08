import test from 'node:test';
import assert from 'node:assert/strict';
import { reportSettingsRoute } from '../src/reportRoutes.js';

test('report settings and scoped variable editor routes', () => {
  assert.deepEqual(reportSettingsRoute('/options/reports'),{identity:null,paramId:null});
  assert.deepEqual(reportSettingsRoute('/options/reports/order_payment/edit'),{identity:'order_payment',paramId:null});
  assert.deepEqual(reportSettingsRoute('/options/reports/order_payment/params/3/edit'),{identity:'order_payment',paramId:'3'});
  assert.equal(reportSettingsRoute('/options/reports/../bad'),null);
});