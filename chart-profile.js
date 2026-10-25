import {getPerson,getBirthFacts} from './person-store.js';
export const CHART_SYSTEMS=[['western','western_web.html','星盘','star'],['bazi','bazi_web.html','八字','yin'],['vedic','vedic_web.html','印占','lotus'],['life','destiny_book_web.html','灵数','diamond']];
export function chartURL(system,id=null){const row=CHART_SYSTEMS.find(r=>r[0]===system);if(!row)throw Error('未知排盘体系。');return row[1]+(id?'?mlPerson='+encodeURIComponent(id):'')+(system==='life'?'#life':'#report');}
export function chartProfileInput(id,system,defaults={},storage=localStorage){
 const p=getPerson(id,storage);if(!p||p.deletedAt)throw Error('档案已删除或不存在，请重新选择。');
 const b=getBirthFacts(id,storage);if(!b.date)throw Error('请先补全或转换出生日期。');
 if(system==='life')return {date:b.date};
 if(!b.time)throw Error('出生时间未知，请先编辑档案补全时间。');
 if(b.latitude===null||b.longitude===null||!b.place)throw Error('请先补全出生地点和经纬度。');
 if(!b.timeResolution.utc)throw Error('出生时区或夏令时存在未确认信息，请先编辑档案核对。');
 if(system==='bazi'){
  if(!b.timezoneId)throw Error('八字需要出生地的地区时区，请先编辑档案选择。');
  if(b.timeResolution.candidates.length>1)throw Error('这个当地时刻发生过两次，原八字引擎暂不能传入所选重复时刻，请先人工核验。');
  if(!p.sex)throw Error('八字起运需要性别，请先编辑档案选择。');
  return {...defaults,date:b.date,time:b.time,place:b.place,latitude:b.latitude,longitude:b.longitude,timezoneId:b.timezoneId,gender:p.sex};
 }
 if(!/^[+-]\d{2}:\d{2}$/.test(b.utcOffset||''))throw Error('此历史时区含秒级偏移，当前占星输入仅支持分钟，请先核验后使用。');
 const residence=p.residence?.place?.status==='known'&&p.residence.place.latitude!==null&&p.residence.place.longitude!==null?{place:p.residence.place.name,latitude:p.residence.place.latitude,longitude:p.residence.place.longitude}:null;
 return {...defaults,date:b.date,time:b.time,place:b.place,latitude:b.latitude,longitude:b.longitude,...(system==='vedic'?{timezoneOffset:b.utcOffset}:{offset:b.utcOffset,residence})};
}
