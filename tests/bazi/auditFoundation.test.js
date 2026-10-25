import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBazi } from '../../src/bazi/services/calculateBazi.js';
import { DEFAULT_BAZI_OPTIONS, normalizeRuleOptions } from '../../src/bazi/rules/ruleOptions.js';

test('用户确认的首版默认规则被显式保存', () => {
  assert.equal(DEFAULT_BAZI_OPTIONS.dayBoundaryRule, 'midnight');
  assert.equal(DEFAULT_BAZI_OPTIONS.trueSolarTime, false);
  assert.equal(DEFAULT_BAZI_OPTIONS.trueSolarBoundaryScope, 'all_pillars');
  assert.deepEqual(DEFAULT_BAZI_OPTIONS.verifiedYearRange, { from: 1901, to: 2100 });
});

test('MVP 返回可追溯四柱与参考对照', () => {
  const result = calculateBazi({ gender:'female',date:'1995-08-12',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight' });
  assert.equal(result.status, 'beta_manual_verification');
  assert.ok(result.calculatedResult.year.name);
  assert.equal(result.audit.length, 7);
  assert.ok(Array.isArray(result.differences));
});

test('换日规则只接受已声明选项', () => {
  assert.equal(normalizeRuleOptions({ dayBoundaryRule: 'zi_hour' }).dayBoundaryRule, 'zi_hour');
  assert.throws(() => normalizeRuleOptions({ dayBoundaryRule: 'unknown' }), RangeError);
});
