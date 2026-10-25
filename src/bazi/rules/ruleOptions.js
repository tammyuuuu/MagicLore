export const DEFAULT_BAZI_OPTIONS = Object.freeze({
  yearBoundaryRule: 'lichun',
  dayBoundaryRule: 'midnight',
  trueSolarTime: false,
  trueSolarBoundaryScope: 'all_pillars',
  calendarSystem: 'proleptic_gregorian',
  verifiedYearRange: Object.freeze({ from: 1901, to: 2100 }),
  twelveGrowthStages: 'not_implemented',
  luckCycleRule: 'year_stem_yinyang_gender__three_days_one_year'
});

export const SUPPORTED_DAY_BOUNDARY_RULES = Object.freeze(['midnight', 'zi_hour']);

export function normalizeRuleOptions(options = {}) {
  const normalized = { ...DEFAULT_BAZI_OPTIONS, ...options };
  if (!SUPPORTED_DAY_BOUNDARY_RULES.includes(normalized.dayBoundaryRule)) {
    throw new RangeError(`不支持的换日规则：${normalized.dayBoundaryRule}`);
  }
  if (normalized.trueSolarBoundaryScope !== 'all_pillars') {
    throw new RangeError('第一阶段只接受真太阳时统一参与四柱边界');
  }
  if (normalized.yearBoundaryRule !== 'lichun') throw new RangeError('第一版只支持立春换年');
  return Object.freeze(normalized);
}
