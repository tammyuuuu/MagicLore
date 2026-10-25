import { SEXAGENARY_CYCLE, SEXAGENARY_BY_NAME } from '../data/sexagenary.js';
import { HEAVENLY_STEMS } from '../data/fundamentals.js';
import { getHiddenStems } from '../data/hiddenStems.js';
import { getTenGod } from './tenGods.js';
import { termsForYear } from '../core/solarTerms.js';

const mod=(n,m)=>((n%m)+m)%m;
function detail(pillar,dayMaster){const item=SEXAGENARY_BY_NAME[pillar],main=getHiddenStems(item.branch).main;return {pillar,stemTenGod:getTenGod(dayMaster,item.stem),branchTenGod:getTenGod(dayMaster,main)};}
function localDate(instant){const d=new Date(instant.getTime()+8*3600000);return `${d.getUTCMonth()+1}/${d.getUTCDate()}`;}
function monthsForYear(year,dayMaster){const annual=SEXAGENARY_CYCLE[mod(year-4,60)],annualStemIndex=HEAVENLY_STEMS.findIndex(x=>x.name===annual.stem);const terms=[...termsForYear(year).filter(x=>x.name!=='小寒'),termsForYear(year+1).find(x=>x.name==='小寒')].sort((a,b)=>a.monthIndex-b.monthIndex);return terms.map(term=>{const stemIndex=mod((annualStemIndex%5)*2+2+term.monthIndex,10),pillar=HEAVENLY_STEMS[stemIndex].name+term.branch;return {...detail(pillar,dayMaster),term:term.name,date:localDate(term.instant),instant:term.instant.toISOString()};});}
export function calculateLuckCycles({gender,yearPillar,monthPillar,hourPillar,dayMaster,birthYear,birthInstant,previousTerm,nextTerm,count=8}){
  const yangYear=['甲','丙','戊','庚','壬'].includes(yearPillar.stem);
  const male=gender==='male';
  const forward=(yangYear&&male)||(!yangYear&&!male);
  const target=forward?new Date(nextTerm.instant):new Date(previousTerm.instant);
  const diffMinutes=Math.abs(target-birthInstant)/60000;
  const startAgeYears=diffMinutes/(3*24*60);
  const startDate=new Date(birthInstant.getTime()+startAgeYears*365.2425*86400000);
  const monthIndex=SEXAGENARY_BY_NAME[monthPillar.name].index;
  const hourIndex=SEXAGENARY_BY_NAME[hourPillar.name].index;
  const cycles=Array.from({length:count},(_,i)=>{const item=SEXAGENARY_CYCLE[mod(monthIndex+(forward?i+1:-(i+1)),60)];const ageStart=startAgeYears+i*10,startYear=startDate.getUTCFullYear()+i*10,endYear=startYear+9;const years=Array.from({length:10},(_,j)=>{const year=startYear+j,nominalAge=year-birthYear+1,annual=SEXAGENARY_CYCLE[mod(year-4,60)],minor=SEXAGENARY_CYCLE[mod(hourIndex+(forward?nominalAge:-nominalAge),60)];return {year,nominalAge,annual:detail(annual.name,dayMaster),minorLuck:detail(minor.name,dayMaster),months:monthsForYear(year,dayMaster)};});return {index:i+1,...detail(item.name,dayMaster),ageStart,ageEnd:ageStart+10,startYear,endYear,years};});
  return {direction:forward?'forward':'reverse',rule:'year_stem_yinyang_gender__three_days_one_year',minorLuckRule:'same_direction_as_luck_cycle__hour_pillar__age_one_first_step',status:'pending_manual_validation',targetTerm:{name:(forward?nextTerm:previousTerm).name,instant:target.toISOString()},differenceMinutes:diffMinutes,startAgeYears,startDate:startDate.toISOString(),cycles};
}
