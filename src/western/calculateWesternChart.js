import {aspectOrbs} from './aspectOrbs.js';
import {SiderealTime} from '../../node_modules/astronomy-engine/esm/astronomy.js';
import {localToUtc,julianTimes,tropicalLongitude,tropicalAscendant,isRetrograde} from '../vedic/astronomy.js';
import {lunarNodeLongitude} from '../vedic/nodes.js';
import {normalizeLongitude as norm} from '../vedic/zodiac.js';
const rad = value => value*Math.PI/180;
const deg = value => value*180/Math.PI;
export const PLANETS=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
export function houseOf(longitude,cusps) {
  for(let i=0;i<12;i++) if(norm(longitude-cusps[i]) < norm(cusps[(i+1)%12]-cusps[i])) return i+1;
  return 12;
}
export function calculateHouses(date,jd,latitude,longitude,system='placidus') {
  const T=(jd-2451545)/36525,eps=rad(23+(26+(21.448-46.815*T-.00059*T*T+.001813*T*T*T)/60)/60);
  const theta=norm(SiderealTime(date)*15+longitude);
  const raToLongitude=ra=>norm(deg(Math.atan2(Math.sin(rad(ra))/Math.cos(eps),Math.cos(rad(ra)))));
  const asc=tropicalAscendant(date,jd,latitude,longitude),mc=raToLongitude(theta);
  if(system==='whole')return {asc,mc,cusps:Array.from({length:12},(_,i)=>norm(Math.floor(asc/30)*30+i*30))};
  if(system==='equal')return {asc,mc,cusps:Array.from({length:12},(_,i)=>norm(asc+i*30))};
  if(system==='alcabitius'){
    // Trisect the equatorial quadrants, then project onto the ecliptic.
    const ascRA=norm(deg(Math.atan2(Math.sin(rad(asc))*Math.cos(eps),Math.cos(rad(asc)))));
    const dayArc=norm(ascRA-theta),nightArc=180-dayArc;
    if(dayArc>=180||nightArc<=0)throw new Error('阿卡比宫制在此纬度无法形成有序宫位，请选择整宫制或等宫制。');
    const cusps=[];
    cusps[0]=asc;cusps[1]=raToLongitude(ascRA+nightArc/3);cusps[2]=raToLongitude(ascRA+2*nightArc/3);cusps[3]=norm(mc+180);
    cusps[9]=mc;cusps[10]=raToLongitude(theta+dayArc/3);cusps[11]=raToLongitude(theta+2*dayArc/3);
    for(let i=0;i<6;i++)if(cusps[i]!==undefined)cusps[i+6]=norm(cusps[i]+180);else cusps[i]=norm(cusps[i+6]+180);
    return {asc,mc,cusps};
  }
  if(system!=='placidus')throw new Error('未知宫制。');
  if(Math.abs(latitude)>=66)throw new Error('该纬度接近极圈，请选择整宫制或等宫制；本版不自动替换宫制。');
  function cusp(fraction,lower) {
    let ra=theta+(lower?180:0)+(lower?-1:1)*90*fraction;
    for(let i=0;i<100;i++) {
      const lambda=raToLongitude(ra),declination=Math.asin(Math.sin(eps)*Math.sin(rad(lambda)));
      const cosine=-Math.tan(rad(latitude))*Math.tan(declination);
      if(Math.abs(cosine)>1)throw new Error('Placidus无法在此纬度收敛，请选整宫或等宫。');
      const semiArc=deg(Math.acos(cosine));
      const next=theta+(lower?180:0)+(lower?-1:1)*(lower?180-semiArc:semiArc)*fraction;
      if(Math.abs(next-ra)<1e-9)return raToLongitude(next);
      ra=next;
    }
    throw new Error('Placidus计算未收敛。');
  }
  const cusps=[];
  cusps[0]=asc;cusps[1]=cusp(2/3,true);cusps[2]=cusp(1/3,true);cusps[3]=norm(mc+180);
  cusps[9]=mc;cusps[10]=cusp(1/3,false);cusps[11]=cusp(2/3,false);
  for(let i=0;i<6;i++)if(cusps[i]!==undefined)cusps[i+6]=norm(cusps[i]+180);else cusps[i]=norm(cusps[i+6]+180);
  return {asc,mc,cusps};
}
export function calculateWesternTransit(natalInput,targetInput) {
  const natal=calculateWesternChart(natalInput),current=calculateWesternChart(targetInput);
  return {...current,asc:natal.asc,mc:natal.mc,cusps:natal.cusps.slice(),aspects:[],planets:current.planets.map(p=>({...p,house:houseOf(p.longitude,natal.cusps)}))};
}
export function calculateWesternChart(input) {
  if(input.transitOrb!==undefined&&(typeof input.transitOrb!=='number'||!Number.isFinite(input.transitOrb)||input.transitOrb<0||input.transitOrb>15))throw Error('行运容许度应在 0–15° 之间。');
  const latitude=Number(input.latitude),longitude=Number(input.longitude);
  if(!Number.isFinite(latitude)||Math.abs(latitude)>89||!Number.isFinite(longitude)||Math.abs(longitude)>180)throw new Error('请检查纬度（-89至89）与经度（-180至180）。');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!/^\d{2}:\d{2}(?::\d{2})?$/.test(input.time))throw new Error('请填写完整出生日期与时间。');
  if(!/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(input.offset))throw new Error('UTC偏移格式为+08:00或-05:00。');
  const utc=localToUtc(input.date,input.time,input.offset);
  if(!Number.isFinite(utc.getTime())||utc.getUTCFullYear()<1800||utc.getUTCFullYear()>2100)throw new Error('本版支持1800至2100年。');
  const {jd,jde}=julianTimes(utc),houses=calculateHouses(utc,jd,latitude,longitude,input.system);
  const activePlanets=input.astrologyMode==='classical'?PLANETS.slice(0,7):PLANETS;
  const planets=activePlanets.map(name=>({name,longitude:tropicalLongitude(name,utc),retrograde:isRetrograde(name,utc)}));
  const node=lunarNodeLongitude(jde,input.nodeType||'mean');
  const nodeMotion=norm(lunarNodeLongitude(jde+.5,input.nodeType||'mean')-lunarNodeLongitude(jde-.5,input.nodeType||'mean')+180)-180;
  planets.push({name:'NorthNode',longitude:node,retrograde:nodeMotion<0},{name:'SouthNode',longitude:norm(node+180),retrograde:nodeMotion<0});
  planets.forEach(p=>p.house=houseOf(p.longitude,houses.cusps));
  const limits=aspectOrbs(input),definitions=[[0,'合相',limits[0]],[60,'六合',limits[60]],[90,'刑相',limits[90]],[120,'拱相',limits[120]],[180,'对冲',limits[180]]];
  const aspects=[];
  planets.slice(0,activePlanets.length).forEach((a,i)=>planets.slice(i+1,activePlanets.length).forEach(b=>{
    const separation=Math.abs(norm(b.longitude-a.longitude+180)-180);
    for(const [angle,label,orb] of definitions)if(Math.abs(separation-angle)<=orb)aspects.push({a:a.name,b:b.name,angle,label,orb:Math.abs(separation-angle)});
  }));
  return {input,utc:utc.toISOString(),jd,...houses,planets,aspects};
}
