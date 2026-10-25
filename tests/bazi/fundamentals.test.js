import test from 'node:test';
import assert from 'node:assert/strict';
import { BRANCH_BY_NAME, EARTHLY_BRANCHES, ELEMENTS, HEAVENLY_STEMS, STEM_BY_NAME, YIN_YANG } from '../../src/bazi/data/fundamentals.js';
import { HIDDEN_STEMS } from '../../src/bazi/data/hiddenStems.js';

test('十干十二支基础数据完整且引用唯一属性集合', () => {
  assert.equal(HEAVENLY_STEMS.length, 10);
  assert.equal(EARTHLY_BRANCHES.length, 12);
  assert.equal(Object.keys(STEM_BY_NAME).length, 10);
  assert.equal(Object.keys(BRANCH_BY_NAME).length, 12);
  for (const item of [...HEAVENLY_STEMS, ...EARTHLY_BRANCHES]) {
    assert.ok(ELEMENTS.includes(item.element));
    assert.ok(YIN_YANG.includes(item.polarity));
  }
});

test('十二地支藏干表完整，所有藏干均为合法天干', () => {
  assert.deepEqual(Object.keys(HIDDEN_STEMS), EARTHLY_BRANCHES.map(item => item.name));
  for (const hidden of Object.values(HIDDEN_STEMS)) {
    assert.ok(hidden.main);
    for (const stem of Object.values(hidden)) if (stem !== null) assert.ok(STEM_BY_NAME[stem]);
  }
});
