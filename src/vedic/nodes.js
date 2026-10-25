import {normalizeLongitude} from './zodiac.js';
const rad=d=>d*Math.PI/180;
export function lunarNodeLongitude(jde,type='true'){
  const T=(jde-2451545)/36525;
  const omega=normalizeLongitude(125.0445479-1934.1362891*T+0.0020754*T*T+T*T*T/467441-T*T*T*T/60616000);
  if(type==='mean')return omega;
  const D=normalizeLongitude(297.8501921+445267.1114034*T-0.0018819*T*T+T*T*T/545868-T*T*T*T/113065000);
  const M=normalizeLongitude(357.5291092+35999.0502909*T-0.0001536*T*T+T*T*T/24490000);
  const Mp=normalizeLongitude(134.9633964+477198.8675055*T+0.0087414*T*T+T*T*T/69699-T*T*T*T/14712000);
  const F=normalizeLongitude(93.272095+483202.0175233*T-0.0036539*T*T-T*T*T/3526000+T*T*T*T/863310000);
  return normalizeLongitude(omega-1.4979*Math.sin(rad(2*(D-F)))-0.15*Math.sin(rad(M))-0.1226*Math.sin(rad(2*D))+0.1176*Math.sin(rad(2*F))-0.0801*Math.sin(rad(2*(Mp-F))));
}
export function nodePair(jde,type='true'){const rahu=lunarNodeLongitude(jde,type);return {rahu,ketu:normalizeLongitude(rahu+180),type};}

