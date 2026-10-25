import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './fundamentals.js';

const NAYIN_PAIRS = Object.freeze([
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木',
  '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'
]);

export const SEXAGENARY_CYCLE = Object.freeze(Array.from({ length: 60 }, (_, index) => {
  const stem = HEAVENLY_STEMS[index % 10].name;
  const branch = EARTHLY_BRANCHES[index % 12].name;
  return Object.freeze({ index, stem, branch, name: stem + branch, nayin: NAYIN_PAIRS[Math.floor(index / 2)] });
}));

export const SEXAGENARY_BY_NAME = Object.freeze(Object.fromEntries(SEXAGENARY_CYCLE.map(item => [item.name, item])));

export function getSexagenary(name) {
  const value = SEXAGENARY_BY_NAME[name];
  if (!value) throw new RangeError(`非法或未知干支：${name}`);
  return value;
}
