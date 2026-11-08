import test from 'node:test';
import assert from 'node:assert/strict';
import { displayDate, isoDate, stepQuantity, priceError } from '../src/pricing.js';

test('Russian dates round-trip, including leap years', () => {
  assert.equal(displayDate('2024-02-29'), '29.02.2024');
  assert.equal(isoDate('29.02.2024'), '2024-02-29');
  assert.equal(isoDate('29.02.2023'), '');
  assert.equal(isoDate('31.04.2024'), '');
  assert.equal(displayDate(null), '');
});

test('quantity buttons stay within the legacy bounds', () => {
  assert.equal(stepQuantity(0, -1), 0);
  assert.equal(stepQuantity(9995, 1), 10000);
  assert.equal(stepQuantity('20', 1), 30);
  assert.equal(stepQuantity('', 1), 10);
});

test('errors distinguish validation, authorization and network failures', () => {
  assert.match(priceError(422), /Проверьте/);
  assert.match(priceError(403), /прав/);
  assert.match(priceError(401), /Войдите/);
  assert.match(priceError(0), /Повторите/);
});