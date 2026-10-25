import { ELEMENTS, requireStem } from '../data/fundamentals.js';

function relation(dayElement, targetElement) {
  const day = ELEMENTS.indexOf(dayElement);
  const target = ELEMENTS.indexOf(targetElement);
  if (day === target) return 'same';
  if ((day + 1) % 5 === target) return 'output';
  if ((day + 2) % 5 === target) return 'wealth';
  if ((target + 2) % 5 === day) return 'authority';
  if ((target + 1) % 5 === day) return 'resource';
  throw new Error(`无法确定五行关系：${dayElement} → ${targetElement}`);
}

const TEN_GOD_NAMES = Object.freeze({
  same: Object.freeze({ same: '比肩', different: '劫财' }),
  output: Object.freeze({ same: '食神', different: '伤官' }),
  wealth: Object.freeze({ same: '偏财', different: '正财' }),
  authority: Object.freeze({ same: '七杀', different: '正官' }),
  resource: Object.freeze({ same: '偏印', different: '正印' })
});

export function getTenGod(dayMasterName, targetStemName) {
  const dayMaster = requireStem(dayMasterName);
  const target = requireStem(targetStemName);
  const polarityKey = dayMaster.polarity === target.polarity ? 'same' : 'different';
  return TEN_GOD_NAMES[relation(dayMaster.element, target.element)][polarityKey];
}
