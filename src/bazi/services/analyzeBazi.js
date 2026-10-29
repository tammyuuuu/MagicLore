import { calculateBazi } from './calculateBazi.js';
import { analyzeBaziJudgment } from '../rules/judgmentEngine.js';

// Interpretation is additive. The audited calendar/fortune-cycle engine is unchanged.
export function calculateBaziWithPatterns(input, options={}) {
  const result=calculateBazi(input,options);
  const judgmentAnalysis=analyzeBaziJudgment(result);
  return {...result,patternAnalysis:judgmentAnalysis.patternAnalysis,judgmentAnalysis};
}
