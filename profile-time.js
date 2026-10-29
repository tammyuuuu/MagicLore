// Birth facts only. Never adjust an invalid wall time or assume an unknown time.
const isoDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export {isoDate};
// Formatter construction is expensive when validating/listing many profiles.
// Cache only timezone formatters, never birth facts or resolved wall times.
const zoneFormatters=new Map();
function wallFormatter(iana){
 let formatter=zoneFormatters.get(iana);
 if(!formatter){formatter=new Intl.DateTimeFormat('en-GB',{timeZone:iana,calendar:'gregory',numberingSystem:'latn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  if(zoneFormatters.size>=128)zoneFormatters.delete(zoneFormatters.keys().next().value);
  zoneFormatters.set(iana,formatter);
 }
 return formatter;
}
export function validateTimeZone(iana){wallFormatter(iana);}
export function offsetSeconds(value){if(typeof value!=='string'||!/^[-+]\d{2}:[0-5]\d(?::[0-5]\d)?$/.test(value))throw Error('UTC 偏移请填写 +08:00 或 -05:00。');const [h,m,s=0]=value.slice(1).split(':').map(Number);if(h>14||h===14&&(m||s))throw Error('UTC 偏移超出 ±14 小时。');return (value[0]==='-'?-1:1)*(h*3600+m*60+s);}
export function formatOffset(seconds){const n=Math.abs(seconds),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return (seconds<0?'-':'+')+[h,m,...(s?[s]:[])].map(x=>String(x).padStart(2,'0')).join(':');}
export function resolveWallTime(date,time,zone={}){
  if(!date)return {status:'unknown-date',candidates:[]};
  if(!time)return {status:'unknown-time',candidates:[]};
  if(!isoDate(date)||!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time))throw Error('出生日期或时间格式无效。');
  const wall=Date.parse(`${date}T${time.length===5?time+':00':time}Z`),fixed=zone.fixedOffset?offsetSeconds(zone.fixedOffset):null;
  if(!zone.iana){return fixed===null?{status:'unknown-zone',candidates:[]}:{status:'fixed-offset',candidates:[{offset:zone.fixedOffset,utc:new Date(wall-fixed*1000).toISOString()}],offset:zone.fixedOffset,utc:new Date(wall-fixed*1000).toISOString()};}
  const formatter=wallFormatter(zone.iana);
  function localStamp(instant){const p=Object.fromEntries(formatter.formatToParts(new Date(instant)).map(x=>[x.type,x.value]));return Date.parse(`${p.year.padStart(4,'0')}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);}
  const offsets=new Set();for(let h=-48;h<=48;h+=6){const instant=wall+h*3600000;offsets.add((localStamp(instant)-instant)/1000);}
  const candidates=[...offsets].map(seconds=>({offset:formatOffset(seconds),utc:new Date(wall-seconds*1000).toISOString()})).filter(c=>localStamp(Date.parse(c.utc))===wall).sort((a,b)=>a.utc.localeCompare(b.utc));
  if(!candidates.length)return {status:'gap',candidates};
  if(fixed!==null&&!candidates.some(c=>offsetSeconds(c.offset)===fixed))return {status:'conflict',candidates};
  const chosen=zone.offsetChoice||zone.fixedOffset;
  if(chosen&&!candidates.some(c=>offsetSeconds(c.offset)===offsetSeconds(chosen)))return {status:'conflict',candidates};
  const match=candidates.length===1?candidates[0]:chosen?candidates.find(c=>offsetSeconds(c.offset)===offsetSeconds(chosen)):null;
  return {status:match?'resolved':'ambiguous',candidates,...(match?match:{})};
}
