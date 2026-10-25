import { SearchSunLongitude } from 'astronomy-engine';

export const MONTH_TERMS = Object.freeze([
  {name:'立春', longitude:315, branch:'寅', monthIndex:0, approx:[2,1]},
  {name:'惊蛰', longitude:345, branch:'卯', monthIndex:1, approx:[3,1]},
  {name:'清明', longitude:15, branch:'辰', monthIndex:2, approx:[4,1]},
  {name:'立夏', longitude:45, branch:'巳', monthIndex:3, approx:[5,1]},
  {name:'芒种', longitude:75, branch:'午', monthIndex:4, approx:[6,1]},
  {name:'小暑', longitude:105, branch:'未', monthIndex:5, approx:[7,1]},
  {name:'立秋', longitude:135, branch:'申', monthIndex:6, approx:[8,1]},
  {name:'白露', longitude:165, branch:'酉', monthIndex:7, approx:[9,1]},
  {name:'寒露', longitude:195, branch:'戌', monthIndex:8, approx:[10,1]},
  {name:'立冬', longitude:225, branch:'亥', monthIndex:9, approx:[11,1]},
  {name:'大雪', longitude:255, branch:'子', monthIndex:10, approx:[12,1]},
  {name:'小寒', longitude:285, branch:'丑', monthIndex:11, approx:[1,1]}
]);

export function termsForYear(year) {
  return MONTH_TERMS.map(term => {
    const startYear = term.name === '小寒' ? year : year;
    const found = SearchSunLongitude(term.longitude, new Date(Date.UTC(startYear, term.approx[0]-1, term.approx[1])), 12);
    if (!found) throw new Error(`无法搜索 ${year} ${term.name}`);
    return {...term, year, instant:new Date(found.date)};
  }).sort((a,b)=>a.instant-b.instant);
}

export function surroundingTerms(instant) {
  const y=instant.getUTCFullYear();
  const all=[...termsForYear(y-1),...termsForYear(y),...termsForYear(y+1)].sort((a,b)=>a.instant-b.instant);
  const nextIndex=all.findIndex(t=>t.instant>instant);
  return { previous:all[nextIndex-1], next:all[nextIndex] };
}

export function lichunForYear(year) {
  return termsForYear(year).find(t=>t.name==='立春');
}
