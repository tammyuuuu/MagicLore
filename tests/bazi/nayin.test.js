import test from 'node:test';
import assert from 'node:assert/strict';
import { SEXAGENARY_BY_NAME, SEXAGENARY_CYCLE } from '../../src/bazi/data/sexagenary.js';

test('六十甲子与纳音完整且无重复干支', () => {
  assert.equal(SEXAGENARY_CYCLE.length, 60);
  assert.equal(Object.keys(SEXAGENARY_BY_NAME).length, 60);
  assert.equal(new Set(SEXAGENARY_CYCLE.map(item => item.name)).size, 60);
  assert.ok(SEXAGENARY_CYCLE.every(item => item.nayin.length > 0));
});

test('纳音两两成组并覆盖三十组', () => {
  for (let index = 0; index < 60; index += 2) {
    assert.equal(SEXAGENARY_CYCLE[index].nayin, SEXAGENARY_CYCLE[index + 1].nayin);
  }
  assert.equal(new Set(SEXAGENARY_CYCLE.map(item => item.nayin)).size, 30);
  assert.equal(SEXAGENARY_BY_NAME.甲子.nayin, '海中金');
  assert.equal(SEXAGENARY_BY_NAME.癸亥.nayin, '大海水');
});
