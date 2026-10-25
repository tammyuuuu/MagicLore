import test from 'node:test';
import assert from 'node:assert/strict';
import { HEAVENLY_STEMS } from '../../src/bazi/data/fundamentals.js';
import { getTenGod } from '../../src/bazi/rules/tenGods.js';

const EXPECTED = Object.freeze({
  甲: ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'],
  乙: ['劫财','比肩','伤官','食神','正财','偏财','正官','七杀','正印','偏印'],
  丙: ['偏印','正印','比肩','劫财','食神','伤官','偏财','正财','七杀','正官'],
  丁: ['正印','偏印','劫财','比肩','伤官','食神','正财','偏财','正官','七杀'],
  戊: ['七杀','正官','偏印','正印','比肩','劫财','食神','伤官','偏财','正财'],
  己: ['正官','七杀','正印','偏印','劫财','比肩','伤官','食神','正财','偏财'],
  庚: ['偏财','正财','七杀','正官','偏印','正印','比肩','劫财','食神','伤官'],
  辛: ['正财','偏财','正官','七杀','正印','偏印','劫财','比肩','伤官','食神'],
  壬: ['食神','伤官','偏财','正财','七杀','正官','偏印','正印','比肩','劫财'],
  癸: ['伤官','食神','正财','偏财','正官','七杀','正印','偏印','劫财','比肩']
});

test('十神 10×10 完整矩阵', () => {
  let checked = 0;
  for (const dayMaster of HEAVENLY_STEMS) {
    HEAVENLY_STEMS.forEach((target, index) => {
      assert.equal(getTenGod(dayMaster.name, target.name), EXPECTED[dayMaster.name][index]);
      checked += 1;
    });
  }
  assert.equal(checked, 100);
});
