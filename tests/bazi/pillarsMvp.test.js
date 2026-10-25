import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBazi } from '../../src/bazi/services/calculateBazi.js';

const base={gender:'female',date:'1995-08-12',time:'14:30',place:'上海',timezoneId:'Asia/Shanghai',longitude:121.4737,latitude:31.2304,trueSolarTime:false,dayBoundaryRule:'midnight'};

test('1995-08-12 14:30 上海的本项目四柱与参考库一致',()=>{
  const result=calculateBazi(base);
  assert.deepEqual(Object.values(result.calculatedResult).map(x=>x.name),['乙亥','甲申','乙亥','癸未']);
  assert.equal(result.differences.length,0);
});

test('真太阳时展示全部修正字段并参与当前使用时间',()=>{
  const result=calculateBazi({...base,trueSolarTime:true});
  assert.equal(result.normalizedTime.usedTimeBasis,'true_solar');
  assert.equal(typeof result.normalizedTime.longitudeCorrectionMinutes,'number');
  assert.equal(typeof result.normalizedTime.equationOfTimeMinutes,'number');
});

test('换日规则切换可导致晚子时日柱变化',()=>{
  const input={...base,time:'23:30'};
  const midnight=calculateBazi({...input,dayBoundaryRule:'midnight'});
  const zi=calculateBazi({...input,dayBoundaryRule:'zi_hour'});
  assert.notEqual(midnight.calculatedResult.day.name,zi.calculatedResult.day.name);
});

test('每步大运包含十年流年与小运供点击分析',()=>{
  const result=calculateBazi(base),first=result.luckCycles.cycles[0];
  assert.equal(first.years.length,10);
  assert.ok(first.years.every(y=>y.annual.pillar&&y.minorLuck.pillar&&y.nominalAge>0));
  assert.ok(first.years.every(y=>y.months.length===12));
});
