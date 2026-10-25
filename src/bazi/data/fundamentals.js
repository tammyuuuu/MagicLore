export const ELEMENTS = Object.freeze(['木', '火', '土', '金', '水']);
export const YIN_YANG = Object.freeze(['阳', '阴']);

export const HEAVENLY_STEMS = Object.freeze([
  { name: '甲', element: '木', polarity: '阳' },
  { name: '乙', element: '木', polarity: '阴' },
  { name: '丙', element: '火', polarity: '阳' },
  { name: '丁', element: '火', polarity: '阴' },
  { name: '戊', element: '土', polarity: '阳' },
  { name: '己', element: '土', polarity: '阴' },
  { name: '庚', element: '金', polarity: '阳' },
  { name: '辛', element: '金', polarity: '阴' },
  { name: '壬', element: '水', polarity: '阳' },
  { name: '癸', element: '水', polarity: '阴' }
]);

export const EARTHLY_BRANCHES = Object.freeze([
  { name: '子', element: '水', polarity: '阳' },
  { name: '丑', element: '土', polarity: '阴' },
  { name: '寅', element: '木', polarity: '阳' },
  { name: '卯', element: '木', polarity: '阴' },
  { name: '辰', element: '土', polarity: '阳' },
  { name: '巳', element: '火', polarity: '阴' },
  { name: '午', element: '火', polarity: '阳' },
  { name: '未', element: '土', polarity: '阴' },
  { name: '申', element: '金', polarity: '阳' },
  { name: '酉', element: '金', polarity: '阴' },
  { name: '戌', element: '土', polarity: '阳' },
  { name: '亥', element: '水', polarity: '阴' }
]);

export const STEM_BY_NAME = Object.freeze(Object.fromEntries(HEAVENLY_STEMS.map(item => [item.name, item])));
export const BRANCH_BY_NAME = Object.freeze(Object.fromEntries(EARTHLY_BRANCHES.map(item => [item.name, item])));

export function requireStem(name) {
  const stem = STEM_BY_NAME[name];
  if (!stem) throw new RangeError(`未知天干：${name}`);
  return stem;
}
