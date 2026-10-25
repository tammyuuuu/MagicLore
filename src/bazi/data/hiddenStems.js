export const HIDDEN_STEMS = Object.freeze({
  子: Object.freeze({ main: '癸', middle: null, residual: null }),
  丑: Object.freeze({ main: '己', middle: '癸', residual: '辛' }),
  寅: Object.freeze({ main: '甲', middle: '丙', residual: '戊' }),
  卯: Object.freeze({ main: '乙', middle: null, residual: null }),
  辰: Object.freeze({ main: '戊', middle: '乙', residual: '癸' }),
  巳: Object.freeze({ main: '丙', middle: '戊', residual: '庚' }),
  午: Object.freeze({ main: '丁', middle: '己', residual: null }),
  未: Object.freeze({ main: '己', middle: '丁', residual: '乙' }),
  申: Object.freeze({ main: '庚', middle: '壬', residual: '戊' }),
  酉: Object.freeze({ main: '辛', middle: null, residual: null }),
  戌: Object.freeze({ main: '戊', middle: '辛', residual: '丁' }),
  亥: Object.freeze({ main: '壬', middle: '甲', residual: null })
});

export function getHiddenStems(branch) {
  const value = HIDDEN_STEMS[branch];
  if (!value) throw new RangeError(`未知地支：${branch}`);
  return value;
}
