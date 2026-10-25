import {RASHI_RULERS} from './metadata/rulers.js';
const SIGNS=Object.keys(RASHI_RULERS);
export const DIGNITY_RULES={Sun:{exaltation:'Aries',debilitation:'Libra'},Moon:{exaltation:'Taurus',debilitation:'Scorpio'},Mars:{exaltation:'Capricorn',debilitation:'Cancer'},Mercury:{exaltation:'Virgo',debilitation:'Pisces'},Jupiter:{exaltation:'Cancer',debilitation:'Capricorn'},Venus:{exaltation:'Pisces',debilitation:'Virgo'},Saturn:{exaltation:'Libra',debilitation:'Aries'}};
export function dignityFor(name,signIndex){const sign=SIGNS[signIndex],rule=DIGNITY_RULES[name];if(!rule)return null;if(RASHI_RULERS[sign]===name)return 'Own Sign';if(rule.exaltation===sign)return 'Exaltation';if(rule.debilitation===sign)return 'Debilitation';return null;}
