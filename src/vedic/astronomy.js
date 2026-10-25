import {AstroTime,Body,Ecliptic,GeoVector,SiderealTime} from '../../node_modules/astronomy-engine/esm/astronomy.js';
import {normalizeLongitude} from './zodiac.js';

export function localToUtc(date,time,timezoneOffset){
  const match=/^([+-])(\d{2}):(\d{2})$/.exec(timezoneOffset);
  if(!match)throw new Error('Time zone must use +HH:MM or -HH:MM.');
  const offset=(match[1]==='-'?-1:1)*(Number(match[2])*60+Number(match[3]));
  const parts=`${date}T${time}`.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if(!parts)throw new Error('Invalid local date/time.');
  return new Date(Date.UTC(+parts[1],+parts[2]-1,+parts[3],+parts[4],+parts[5]-offset,+(parts[6]||0)));
}
export function julianTimes(date){const astroTime=new AstroTime(date);return {astroTime,jd:2451545+astroTime.ut,jde:2451545+astroTime.tt,deltaTSeconds:(astroTime.tt-astroTime.ut)*86400};}
export function tropicalLongitude(body,date){return normalizeLongitude(Ecliptic(GeoVector(Body[body],date,true)).elon);}
export function isRetrograde(body,date){if(body==='Sun'||body==='Moon')return false;const dt=6*3600000,a=tropicalLongitude(body,new Date(date.getTime()-dt)),b=tropicalLongitude(body,new Date(date.getTime()+dt));let diff=normalizeLongitude(b-a);if(diff>180)diff-=360;return diff<0;}
function meanObliquity(jd){const T=(jd-2451545)/36525;return 23+(26+(21.448-46.815*T-0.00059*T*T+0.001813*T*T*T)/60)/60;}
export function tropicalAscendant(date,jd,latitude,longitude){
  const theta=normalizeLongitude(SiderealTime(date)*15+Number(longitude))*Math.PI/180;
  const phi=Number(latitude)*Math.PI/180,eps=meanObliquity(jd)*Math.PI/180;
  // The raw atan2 expression gives the western intersection; +180° selects the eastern
  // ecliptic/horizon intersection (Ascendant rather than Descendant).
  return normalizeLongitude(Math.atan2(-Math.cos(theta),Math.sin(eps)*Math.tan(phi)+Math.cos(eps)*Math.sin(theta))*180/Math.PI+180);
}
