import lunarPkg from 'lunar-javascript';
import { parseCivilTime, localParts, applyTrueSolarTime, formatParts } from '../core/time.js';
import { surroundingTerms } from '../core/solarTerms.js';
import { getYearPillar,getMonthPillar,getDayPillar,getHourPillar } from '../rules/pillars.js';
import { normalizeRuleOptions } from '../rules/ruleOptions.js';
import { STEM_BY_NAME, BRANCH_BY_NAME } from '../data/fundamentals.js';
import { getHiddenStems } from '../data/hiddenStems.js';
import { getTenGod } from '../rules/tenGods.js';
import { getSexagenary } from '../data/sexagenary.js';
import { calculateLuckCycles } from '../rules/luckCycles.js';

const {Solar}=lunarPkg;
export const BAZI_ENGINE_VERSION='0.2.0-beta-manual-verification';

function pillarDetail(pillar,dayMaster,key){
  const hidden=getHiddenStems(pillar.branch);
  const hiddenList=Object.entries(hidden).filter(([,v])=>v).map(([role,stem])=>({role,stem,tenGod:getTenGod(dayMaster,stem),element:STEM_BY_NAME[stem].element,polarity:STEM_BY_NAME[stem].polarity}));
  return {...pillar,key,tenGod:key==='day'?'日主':getTenGod(dayMaster,pillar.stem),stemAttributes:STEM_BY_NAME[pillar.stem],branchAttributes:BRANCH_BY_NAME[pillar.branch],hiddenStems:hiddenList,branchTenGods:hiddenList.map(x=>x.tenGod),nayin:getSexagenary(pillar.name).nayin,status:'pending_manual_validation'};
}
function referenceResult(parts,dayBoundaryRule){
  const lunar=Solar.fromYmdHms(parts.year,parts.month,parts.day,parts.hour,parts.minute,parts.second||0).getLunar();
  const ec=lunar.getEightChar();ec.setSect(dayBoundaryRule==='zi_hour'?1:2);
  return {lunarDate:lunar.toString(),pillars:{year:ec.getYear(),month:ec.getMonth(),day:ec.getDay(),hour:ec.getTime()},source:'lunar-javascript 1.7.7',sect:ec.getSect()};
}
function compare(calculated,reference){const differences=[];for(const key of ['year','month','day','hour']){const ours=calculated[key].name,theirs=reference.pillars[key];if(ours!==theirs)differences.push({pillar:key,calculated:ours,reference:theirs});}return differences;}
function validate(input){for(const key of ['gender','date','time','place','timezoneId','longitude','latitude'])if(input?.[key]===undefined||input[key]==='')throw new TypeError(`缺少输入：${key}`);if(!['male','female'].includes(input.gender))throw new RangeError('gender 必须为 male 或 female');if(+input.longitude < -180||+input.longitude>180||+input.latitude < -90||+input.latitude>90)throw new RangeError('经纬度超出范围');}

export function calculateBazi(input,options={}){
  validate(input);
  const rules=normalizeRuleOptions({...options,trueSolarTime:input.trueSolarTime??options.trueSolarTime,dayBoundaryRule:input.dayBoundaryRule||options.dayBoundaryRule});
  const parsed=parseCivilTime(input.date,input.time,input.timezoneId),solar=applyTrueSolarTime(parsed,+input.longitude);
  const usedParts=rules.trueSolarTime?solar.corrected:localParts(parsed),calculationInstant=new Date(parsed.instant.getTime()+(rules.trueSolarTime?solar.correctionMinutes*60000:0));
  const year=getYearPillar(calculationInstant),month=getMonthPillar(calculationInstant,year),day=getDayPillar(usedParts,rules.dayBoundaryRule),hour=getHourPillar(usedParts,day);
  const basic={year,month,day,hour},calculatedResult=Object.fromEntries(Object.entries(basic).map(([k,v])=>[k,pillarDetail(v,day.stem,k)]));
  const reference=referenceResult(usedParts,rules.dayBoundaryRule),differences=compare(calculatedResult,reference),terms=surroundingTerms(calculationInstant);
  const luckCycles=calculateLuckCycles({gender:input.gender,yearPillar:year,monthPillar:month,hourPillar:hour,dayMaster:day.stem,birthYear:usedParts.year,birthInstant:calculationInstant,previousTerm:terms.previous,nextTerm:terms.next});
  const audit=[
    {stage:'civil_time',input:`${input.date} ${input.time}`,rule:`IANA ${input.timezoneId}`,output:parsed.instant.toISOString()},
    {stage:'true_solar_time',input:formatParts(solar.original),rule:'longitude correction + NOAA-style Equation of Time approximation',output:formatParts(solar.corrected),details:solar,warning:'待人工验证'},
    {stage:'year_pillar',input:calculationInstant.toISOString(),rule:'actual lichun solar longitude 315°',output:year.name,details:year.basis},
    {stage:'month_pillar',input:calculationInstant.toISOString(),rule:'actual 12 jie + 五虎遁',output:month.name,details:month.basis},
    {stage:'day_pillar',input:formatParts(usedParts),rule:rules.dayBoundaryRule,output:day.name,details:day.basis},
    {stage:'hour_pillar',input:formatParts(usedParts),rule:'十二时辰 + 五鼠遁',output:hour.name,details:hour.basis},
    {stage:'reference_compare',rule:'lunar-javascript',output:differences.length?'different':'all_match',details:differences}
  ];
  return {status:'beta_manual_verification',input:{...input,longitude:+input.longitude,latitude:+input.latitude},options:rules,normalizedTime:{civil:formatParts(solar.original),timezoneId:input.timezoneId,utcOffsetSeconds:parsed.offsetSeconds,utcInstant:parsed.instant.toISOString(),longitude:+input.longitude,latitude:+input.latitude,standardMeridian:solar.standardMeridian,longitudeCorrectionMinutes:solar.longitudeCorrectionMinutes,equationOfTimeMinutes:solar.equationOfTimeMinutes,trueSolarTime:formatParts(solar.corrected),usedTime:formatParts(usedParts),usedTimeBasis:rules.trueSolarTime?'true_solar':'civil'},calendar:{gregorian:`${input.date} ${input.time}`,lunar:reference.lunarDate},solarTerms:{previous:{name:terms.previous.name,instant:terms.previous.instant.toISOString()},next:{name:terms.next.name,instant:terms.next.instant.toISOString()}},calculatedResult,referenceResult:reference,differences,luckCycles,audit,warnings:['八字排盘 Beta / 人工验盘阶段','年、月、日、时柱及真太阳时均待人工验盘','起运算法待人工验证'],versions:{engine:BAZI_ENGINE_VERSION,tzdb:'@js-joda/timezone 2.25.2',astronomy:'astronomy-engine 2.1.19',lunar:'lunar-javascript 1.7.7'}};
}
