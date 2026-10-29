import {NOTES_KEY,readNotes,validateNotes,mergeNotes} from './notes-store.js';
import {STORES,LABELS,archiveRef,read as readLegacy,snapshot as legacySnapshot,parseBackup as parseLegacy,recover as recoverLegacy} from './profile-store.js';
import {isoDate,offsetSeconds,resolveWallTime} from './profile-time.js';
import {loadProfileCalendar} from './profile-calendar-loader.js';
export const PEOPLE_KEY='magiclore_people_v1';
const PENDING='magiclore_people_pending_v1',JOURNAL='magiclore_people_recovery_v1';
const copy=x=>JSON.parse(JSON.stringify(x));
const empty=()=>({schemaVersion:1,records:[],selectedId:null,hiddenLegacy:[]});
const idValid=id=>typeof id==='string'&&/^[a-zA-Z0-9_.:-]{1,180}$/.test(id);
const newId=()=>crypto.randomUUID();
export function validatePerson(p){
  if(!p||!idValid(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>100)throw Error('人物档案名称或 ID 无效。');
  if(typeof p.notes!=='string'||p.notes.length>5000||!p.birth)throw Error('出生资料或备注无效。');
  if(p.revision!==undefined&&(!Number.isSafeInteger(p.revision)||p.revision<1))throw Error('档案修订号无效。');
  const {date,time,place,zone}=p.birth;if(!date||!['gregorian','lunar','unknown'].includes(date.calendar))throw Error('出生历法无效。');
  if(date.calendar==='unknown'){if(date.value!==null||date.gregorian!==null)throw Error('未知日期不能带有推测日期。');}
  else if(date.calendar==='gregorian'){if(!isoDate(date.value)||date.gregorian!==date.value)throw Error('公历出生日期无效。');}
  else if(!/^(?!0000)\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|30)$/.test(date.value)||date.isLeapMonth!==null&&typeof date.isLeapMonth!=='boolean'||date.gregorian!==null&&(!isoDate(date.gregorian)||date.isLeapMonth===null))throw Error('农历原始日期无效。');
  if(time!==null&&(typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)))throw Error('出生时间无效。');
  if(!place||!['known','unknown'].includes(place.status)||place.name!==null&&typeof place.name!=='string')throw Error('出生地点无效。');
  if(place.status==='known'&&(!place.name?.trim()||place.name.length>500))throw Error('请填写已知地点名称，或标记地点未知。');
  for(const [key,max] of [['latitude',90],['longitude',180]])if(place[key]!==null&&(typeof place[key]!=='number'||!Number.isFinite(place[key])||Math.abs(place[key])>max))throw Error('经纬度无效。');
  if(place.status==='unknown'&&(place.name!==null||place.latitude!==null||place.longitude!==null))throw Error('未知地点不能带有推测坐标。');
  if(!zone||zone.iana!==null&&typeof zone.iana!=='string')throw Error('时区资料无效。');
  if(zone.iana!==null&&(!zone.iana.trim()||zone.iana.length>100))throw Error('时区无效，未知时请留空。');
  if(zone.iana)new Intl.DateTimeFormat('en',{timeZone:zone.iana});
  for(const field of ['fixedOffset','offsetChoice'])if(zone[field]!==null)offsetSeconds(zone[field]);
  if(p.residence!==undefined&&p.residence!==null){if(!p.residence.place||!p.residence.zone)throw Error('现居地点资料无效。');validatePerson({...p,residence:null,birth:{...p.birth,place:p.residence.place,zone:p.residence.zone}});}
  if(p.sex!==null&&!['female','male'].includes(p.sex))throw Error('性别资料无效。');
  if(p.deletedAt!==null&&typeof p.deletedAt!=='string')throw Error('删除标记无效。');
  if(JSON.stringify(p).length>500000)throw Error('单份人物档案过大。');return p;
}
export function validatePeople(data){
  if(!data||data.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>10000||!Array.isArray(data.hiddenLegacy)||data.hiddenLegacy.some(x=>typeof x!=='string'))throw Error('人物档案版本或格式无法读取。');
  const seen=new Set();for(const p of data.records){validatePerson(p);if(seen.has(p.id))throw Error('人物档案 ID 重复。');seen.add(p.id);}
  if(data.selectedId!==null&&(!idValid(data.selectedId)||!data.records.some(p=>p.id===data.selectedId&&!p.deletedAt)))throw Error('所选人物档案不存在。');return data;
}
function rawSnapshot(keys,storage){return {version:1,values:Object.fromEntries(keys.map(k=>[k,storage.getItem(k)]))};}
function restoreRaw(snapshot,storage){if(snapshot?.version!==1||!snapshot.values)throw Error('档案恢复记录无效。');const allowed=new Set([PEOPLE_KEY,NOTES_KEY,...Object.values(STORES)]);for(const [key,raw] of Object.entries(snapshot.values)){if(!allowed.has(key)||raw!==null&&typeof raw!=='string')throw Error('档案恢复记录包含无效键。');}for(const [key,raw] of Object.entries(snapshot.values))if(raw===null)storage.removeItem(key);else storage.setItem(key,raw);}
export function initializePeople(storage=localStorage){const raw=storage.getItem(PENDING);if(raw){restoreRaw(JSON.parse(raw),storage);storage.removeItem(PENDING);}}
export function readPeople(storage=localStorage){initializePeople(storage);const raw=storage.getItem(PEOPLE_KEY);return raw?validatePeople(JSON.parse(raw)):empty();}
function commit(values,storage){
  initializePeople(storage);const before=rawSnapshot(Object.keys(values),storage);
  storage.setItem(JOURNAL,JSON.stringify(before));storage.setItem(PENDING,JSON.stringify(before));
  try{for(const [key,value] of Object.entries(values))storage.setItem(key,value);storage.removeItem(PENDING);}
  catch(error){try{restoreRaw(before,storage);storage.removeItem(PENDING);}catch{throw Error('保存失败，恢复记录已保留；请重新打开档案并导出备份。');}throw error;}
}
function saveEnvelope(data,storage){validatePeople(data);commit({[PEOPLE_KEY]:JSON.stringify(data)},storage);}
// Add the default once without replacing existing profiles or reviving a deleted default.
export function ensureDefaultPerson(storage=localStorage){
  retireDefaultFemalePerson(storage);
  const data=readPeople(storage);
  const existing=data.records.find(p=>p.id==='magiclore-default-20000101'&&!p.deletedAt);
  const beijingResidence=()=>({place:{status:'known',name:'北京',locationId:null,latitude:39.9042,longitude:116.4074,source:'default'},zone:{iana:'Asia/Shanghai',fixedOffset:null,offsetChoice:null}});
  if(existing&&(existing.sex===null||existing.residence==null||existing.name==='默认档案（男）')){if(existing.name==='默认档案（男）')existing.name='默认档案';if(existing.sex===null)existing.sex='male';if(existing.residence==null)existing.residence=beijingResidence();existing.revision=(existing.revision||1)+1;existing.updatedAt=new Date().toISOString();saveEnvelope(data,storage);return copy(existing);}
  if(data.records.some(p=>p.id==='magiclore-default-20000101'))return null;
  const now=new Date().toISOString();
  const person={id:'magiclore-default-20000101',name:'默认档案',sex:'male',notes:'',residence:beijingResidence(),revision:1,createdAt:now,updatedAt:now,deletedAt:null,birth:{date:{calendar:'gregorian',value:'2000-01-01',gregorian:'2000-01-01',isLeapMonth:null,conversion:null},time:'12:00',place:{status:'known',name:'北京',locationId:null,latitude:39.9042,longitude:116.4074,source:'default'},zone:{iana:'Asia/Shanghai',fixedOffset:null,offsetChoice:null},originalInput:{date:'2000-01-01',time:'12:00',place:'北京'}}};
  data.records.push(person);if(!data.selectedId)data.selectedId=person.id;saveEnvelope(data,storage);return copy(person);
}
// Retire only the previously seeded female profile and its generated example pair.
export function retireDefaultFemalePerson(storage=localStorage){
 const marker='magiclore_single_default_v1';if(storage.getItem(marker))return;
 const data=readPeople(storage),female=data.records.find(p=>p.id==='magiclore-default-female-20000101');let changed=false;
 if(female&&!female.deletedAt){female.deletedAt=new Date().toISOString();female.updatedAt=female.deletedAt;female.revision=(female.revision||1)+1;if(data.selectedId===female.id)data.selectedId=null;changed=true;}
 const oldPair='magiclore-default-20000101_magiclore-default-female-20000101';
 for(const item of legacyRecords(storage).rows)if(item.type==='relationship'&&item.record.id===oldPair&&!data.hiddenLegacy.includes(item.key)){data.hiddenLegacy.push(item.key);changed=true;}
 if(changed)saveEnvelope(data,storage);storage.setItem(marker,'1');
}
export function retireOldRelationshipCharts(storage=localStorage){
  const marker='magiclore_retired_relationship_charts_v2';if(storage.getItem(marker))return;
  const legacy=legacyRecords(storage);if(legacy.errors.some(e=>e.type==='relationship'))return;
  for(const item of legacy.rows){const r=item.record;if(item.type==='relationship'&&!(r.personAId&&r.personBId))hideLegacy(item.key,true,storage);}
  storage.setItem(marker,'1');
}
export function listPeople({includeDeleted=false}={},storage=localStorage){return readPeople(storage).records.filter(p=>includeDeleted||!p.deletedAt);}
export function getPerson(id,storage=localStorage){return copy(readPeople(storage).records.find(p=>p.id===id)||null);}
export function savePerson(facts,id=null,storage=localStorage){
  const data=readPeople(storage),index=id?data.records.findIndex(p=>p.id===id):-1;if(id&&index<0)throw Error('人物档案不存在，请重新打开。');
  const old=index<0?null:data.records[index],now=new Date().toISOString();
  if(old&&facts.revision!==undefined&&facts.revision!==(old.revision||1))throw Error('这份档案已在其他页面修改，请重新打开后编辑。');
  const p={...copy(facts),id:old?.id||newId(),revision:(old?.revision||0)+1,createdAt:old?.createdAt||now,updatedAt:now,deletedAt:old?.deletedAt||null};validatePerson(p);
  if(index<0)data.records.unshift(p);else data.records[index]=p;saveEnvelope(data,storage);return copy(p);
}
export function setPersonDeleted(id,deleted=true,storage=localStorage){const data=readPeople(storage),p=data.records.find(p=>p.id===id);if(!p)throw Error('人物档案不存在。');p.deletedAt=deleted?new Date().toISOString():null;p.updatedAt=new Date().toISOString();p.revision=(p.revision||1)+1;if(deleted&&data.selectedId===id)data.selectedId=null;saveEnvelope(data,storage);}
export function selectPerson(id,storage=localStorage){const data=readPeople(storage);if(id&&!data.records.some(p=>p.id===id&&!p.deletedAt))throw Error('人物档案不存在。');data.selectedId=id;saveEnvelope(data,storage);}
export function getSelectedPerson(storage=localStorage){const data=readPeople(storage);return copy(data.records.find(p=>p.id===data.selectedId&&!p.deletedAt)||null);}
export function getBirthFacts(id,storage=localStorage){
  const p=getPerson(id,storage);if(!p||p.deletedAt)throw Error('人物档案不可用。');const b=p.birth,missing=[];
  if(!b.date.gregorian)missing.push('date');if(!b.time)missing.push('time');if(b.place.status==='unknown')missing.push('place');if(b.place.latitude===null||b.place.longitude===null)missing.push('coordinates');
  const resolution=resolveWallTime(b.date.gregorian,b.time,b.zone);if(!resolution.utc)missing.push('timezoneResolution');
  return {profileId:p.id,name:p.name,date:b.date.gregorian,time:b.time,place:b.place.name,latitude:b.place.latitude,longitude:b.place.longitude,timezoneId:b.zone.iana,utcOffset:resolution.offset||null,sex:p.sex,originalInput:copy(b.originalInput||null),missing,timeResolution:resolution};
}
export function legacyRecords(storage=localStorage){const rows=[],errors=[];for(const type of Object.keys(STORES)){try{const counts=new Map();for(const record of readLegacy(type,storage)){if(!record||typeof record!=='object'||Array.isArray(record)){errors.push({type,message:`${LABELS[type]}中有无法读取的条目，请保留原始备份。`});continue;}const ref=archiveRef(record),occurrence=counts.get(ref)||0;counts.set(ref,occurrence+1);rows.push({type,label:LABELS[type],record:copy(record),ref,key:`${type}:${ref}:${occurrence}`});}}catch(error){errors.push({type,message:error.message});}}return {rows,errors};}
const nullableNumber=value=>value===undefined||value===null||value===''?null:Number.isFinite(Number(value))?Number(value):null;
export function personFromLegacy(item,side='a'){
  const r=item.record,i=r.input||{},pair=item.type==='relationship',date=pair?(side==='b'?r.isoB:r.isoA):r.iso||i.date||null;
  const objective=Object.fromEntries(['date','time','place','longitude','latitude','timezoneId','offset','timezoneOffset','gender','calendar','calendarType','lunarDate','isLeapMonth'].filter(k=>i[k]!==undefined).map(k=>[k,copy(i[k])]));
  const validTime=typeof i.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(i.time)?i.time:null;
  const name=typeof(r.title||r.name)==='string'?(r.title||r.name):'';
  const calendar=typeof i.calendar==='string'?i.calendar:i.calendarType,lunar=calendar==='lunar',unrecognized=calendar&&!['gregorian','solar','lunar'].includes(calendar),knownDate=isoDate(date)&&!unrecognized&&!lunar,placeName=typeof i.place==='string'&&i.place.trim()?i.place:null;
  let iana=typeof i.timezoneId==='string'?i.timezoneId:null;try{if(iana)new Intl.DateTimeFormat('en',{timeZone:iana});}catch{iana=null;}
  let fixedOffset=i.offset||i.timezoneOffset||null;try{if(fixedOffset)offsetSeconds(fixedOffset);}catch{fixedOffset=null;}
  return {name,sex:['male','female'].includes(i.gender)?i.gender:null,notes:typeof r.note==='string'?r.note:'',birth:{date:{calendar:lunar?'lunar':knownDate?'gregorian':'unknown',value:lunar?(i.lunarDate||date):knownDate?date:null,isLeapMonth:lunar&&typeof i.isLeapMonth==='boolean'?i.isLeapMonth:null,gregorian:knownDate?date:null,conversion:null},time:validTime,place:{status:placeName?'known':'unknown',name:placeName,locationId:null,latitude:placeName?nullableNumber(i.latitude):null,longitude:placeName?nullableNumber(i.longitude):null,source:'legacy'},zone:{iana,fixedOffset,offsetChoice:null},originalInput:pair?{date,side}:item.type==='personal'?{date:r.iso}:objective},provenance:{store:item.type,reference:item.ref,sourceId:r.id??null,...(pair?{side}:{})}};
}
export function hideLegacy(key,hidden=true,storage=localStorage){const data=readPeople(storage);data.hiddenLegacy=hidden?[...new Set([...data.hiddenLegacy,key])]:data.hiddenLegacy.filter(k=>k!==key);saveEnvelope(data,storage);}
export function exportProfiles(storage=localStorage){initializePeople(storage);return {format:'MagicLore',version:2,exportedAt:new Date().toISOString(),peopleRaw:storage.getItem(PEOPLE_KEY),notes:readNotes(storage),stores:legacySnapshot(storage).stores};}
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
function contentKey(p){const {id,conflictOf,...rest}=p;return canonical(rest);}
export async function importProfiles(text,storage=localStorage){
  if(text.length>12000000)throw Error('备份超过 12 MB。');const data=JSON.parse(text);if(data.format!=='MagicLore'||![1,2].includes(data.version))throw Error('不支持的备份格式或版本。');
  if(!data.stores||typeof data.stores!=='object'||Array.isArray(data.stores)||Object.keys(data.stores).some(type=>!(type in STORES)))throw Error('备份包含无法识别的档案类别，请保留原文件。');
  const incomingLegacy=parseLegacy(JSON.stringify({...data,version:1}));let incoming=null;
  if(data.version===2&&data.peopleRaw!==null){if(typeof data.peopleRaw!=='string')throw Error('人物备份格式无效。');incoming=validatePeople(JSON.parse(data.peopleRaw));}
  if(incoming?.records.some(p=>p.birth.date.calendar==='lunar'&&p.birth.date.gregorian)){const {lunarToGregorian}=await loadProfileCalendar();for(const p of incoming.records){const d=p.birth.date;if(d.calendar==='lunar'&&d.gregorian&&lunarToGregorian(d.value,d.isLeapMonth).gregorian!==d.gregorian)throw Error('农历原值与备份中的公历不一致，请核对原始文件。');}}
  const values={},current=readPeople(storage),idMap={};let added=0,conflicts=0;
  if(data.notes!==undefined)validateNotes(data.notes);
  if(incoming){for(const p of incoming.records){const same=current.records.find(r=>r.id===p.id);if(same&&canonical(same)===canonical(p))continue;if(same){const existingConflict=current.records.find(r=>r.conflictOf===p.id&&contentKey(r)===contentKey(p));if(existingConflict){idMap[p.id]=existingConflict.id;continue;}const conflictId=newId();current.records.push({...copy(p),id:conflictId,conflictOf:p.id});idMap[p.id]=conflictId;conflicts++;}else current.records.push(copy(p));added++;}current.hiddenLegacy=[...new Set([...current.hiddenLegacy,...incoming.hiddenLegacy])];validatePeople(current);values[PEOPLE_KEY]=JSON.stringify(current);}
  for(const [type,rows] of Object.entries(incomingLegacy)){const old=readLegacy(type,storage),seen=new Set(old.map(canonical)),merged=[...old];for(const row of rows)if(!seen.has(canonical(row))){seen.add(canonical(row));merged.push(row);}if(merged.length>10000)throw Error('旧档案超过 10000 条。');if(merged.length!==old.length)values[STORES[type]]=JSON.stringify(merged);}
  if(data.notes!==undefined)values[NOTES_KEY]=JSON.stringify(mergeNotes(readNotes(storage),data.notes,idMap));
  if(Object.keys(values).length)commit(values,storage);return {added,conflicts};
}
export function recoverProfiles(storage=localStorage){initializePeople(storage);const raw=storage.getItem(JOURNAL);if(!raw)return recoverLegacy(storage);const previous=JSON.parse(raw),before=rawSnapshot(Object.keys(previous.values||{}),storage);storage.setItem(PENDING,JSON.stringify(before));try{restoreRaw(previous,storage);storage.setItem(JOURNAL,JSON.stringify(before));storage.removeItem(PENDING);}catch(error){restoreRaw(before,storage);storage.removeItem(PENDING);throw error;}}
