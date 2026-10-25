import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../data/fundamentals.js';
import { SEXAGENARY_CYCLE } from '../data/sexagenary.js';
import { lichunForYear, surroundingTerms } from '../core/solarTerms.js';

const mod=(n,m)=>((n%m)+m)%m;
const dateNumber=p=>Math.floor(Date.UTC(p.year,p.month-1,p.day)/86400000);
// 可解释连续日基准：lunar-javascript 对照确认 2000-01-07 为甲子日（序号 0）。
const JIAZI_ANCHOR=Object.freeze({year:2000,month:1,day:7,index:0});

export function getYearPillar(instant) {
  const civilYear=instant.getUTCFullYear(), lichun=lichunForYear(civilYear);
  const pillarYear=instant<lichun.instant?civilYear-1:civilYear;
  const item=SEXAGENARY_CYCLE[mod(pillarYear-4,60)];
  return {...item, basis:{rule:'lichun',pillarYear,lichun:lichun.instant.toISOString()}};
}

export function getMonthPillar(instant, yearPillar) {
  const {previous,next}=surroundingTerms(instant);
  const monthIndex=previous.monthIndex;
  const yearStemIndex=HEAVENLY_STEMS.findIndex(s=>s.name===yearPillar.stem);
  const stemIndex=mod((yearStemIndex%5)*2+2+monthIndex,10);
  return {stem:HEAVENLY_STEMS[stemIndex].name,branch:previous.branch,name:HEAVENLY_STEMS[stemIndex].name+previous.branch,basis:{rule:'jie',previous:{name:previous.name,instant:previous.instant.toISOString()},next:{name:next.name,instant:next.instant.toISOString()}}};
}

export function getDayPillar(parts, dayBoundaryRule='midnight') {
  let effective={...parts};
  if(dayBoundaryRule==='zi_hour'&&parts.hour>=23){const d=new Date(Date.UTC(parts.year,parts.month-1,parts.day)+86400000);effective={...effective,year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};}
  const index=mod(JIAZI_ANCHOR.index+dateNumber(effective)-dateNumber(JIAZI_ANCHOR),60);
  return {...SEXAGENARY_CYCLE[index],basis:{rule:dayBoundaryRule,anchor:'2000-01-07=甲子',effectiveDate:`${effective.year}-${effective.month}-${effective.day}`}};
}

export function getHourPillar(parts,dayPillar){
  const branchIndex=Math.floor(((parts.hour+1)%24)/2);
  const dayStemIndex=HEAVENLY_STEMS.findIndex(s=>s.name===dayPillar.stem);
  const stemIndex=mod((dayStemIndex%5)*2+branchIndex,10);
  return {stem:HEAVENLY_STEMS[stemIndex].name,branch:EARTHLY_BRANCHES[branchIndex].name,name:HEAVENLY_STEMS[stemIndex].name+EARTHLY_BRANCHES[branchIndex].name,basis:{hour:parts.hour,branchIndex,rule:'五鼠遁'}};
}
