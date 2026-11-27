import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const detail = readFileSync(new URL('../src/OrderDetail.svelte', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/OrderForm.svelte', import.meta.url), 'utf8');

test('order forms expose negotiated sale total, volume and wide dimensions', () => {
  for (const id of ['detail_total', 'detail_volume', 'detail_width', 'detail_height']) {
    assert.match(detail, new RegExp(`id="${id}"`));
  }
  for (const id of ['order_total', 'order_volume', 'order_width', 'order_height']) {
    assert.match(form, new RegExp(`id="${id}"`));
  }
  assert.match(detail, /total: form\.total/);
  assert.match(form, /order_total: total/);
  assert.match(form, /order_width: width/);
  assert.match(form, /order_height: height/);
});