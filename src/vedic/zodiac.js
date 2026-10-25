export const SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const normalizeLongitude=value=>((Number(value)%360)+360)%360;

export function splitLongitude(value){
  const longitude=normalizeLongitude(value);
  const signIndex=Math.floor(longitude/30);
  const inSign=longitude-signIndex*30;
  let degree=Math.floor(inSign),arcminute=Math.floor((inSign-degree)*60);
  let arcsecond=Math.round((((inSign-degree)*60)-arcminute)*60);
  if(arcsecond===60){arcsecond=0;arcminute++;}
  if(arcminute===60){arcminute=0;degree++;}
  if(degree===30)return {longitude,signIndex:(signIndex+1)%12,sign:SIGNS[(signIndex+1)%12],degree:0,arcminute:0,arcsecond:0,inSignDegrees:0};
  return {longitude,signIndex,sign:SIGNS[signIndex],degree,arcminute,arcsecond,inSignDegrees:inSign};
}

export function formatDms(value){const p=splitLongitude(value);return `${p.degree}°${String(p.arcminute).padStart(2,'0')}'${String(p.arcsecond).padStart(2,'0')}\"`;}

