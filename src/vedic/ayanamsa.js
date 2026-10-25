import {normalizeLongitude} from './zodiac.js';
export const AYANAMSA_MODES={LAHIRI:'lahiri',PUSHYA_PAKSHA:'pushya_paksha'};
// Mean Lahiri/Chitrapaksha ayanamsa: IAE/Swiss-compatible J2000 TT anchor,
// advanced with the IAU 1976 general precession in ecliptic longitude.
// T is Julian centuries of TT from J2000; coefficients are arcseconds.
export function lahiriAyanamsa(jde){
  const T=(jde-2451545.0)/36525;
  const precessionArcsec=5029.0966*T+1.11113*T*T-0.000006*T*T*T;
  const arcsec=23*3600+51*60+25.5324+precessionArcsec;
  return normalizeLongitude(arcsec/3600);
}

/*
 * Pushya-paksha ayanamsa (P.V.R. Narasimha Rao / JHora):
 *   ayanamsa = tropical longitude of Delta Cancri - 106°.
 * Delta Cancri (Asellus Australis) is fixed at sidereal 16° Cancer.
 *
 * Star data: ICRS/J2000 RA 08h44m41.099s, Dec +18°09'15.51",
 * proper motion RA*cos(dec) -18.435 mas/year, Dec -227.813 mas/year.
 * Position is propagated for proper motion, precessed from J2000 with the
 * IAU 1976 mean-equator model, then converted using mean obliquity of date.
 * This reproduces Rao's published 2000-01-01 06:00 IST reference value
 * 22°43'19.12" to about 0.05 arcsecond; no fixed Lahiri offset is used.
 * Source: P.V.R. Narasimha Rao, "Introducing Pushya-paksha Ayanamsa".
 */
const DELTA_CANCRI={raDegrees:(8+44/60+41.099/3600)*15,decDegrees:18+9/60+15.51/3600,pmRaCosDecMasYear:-18.435,pmDecMasYear:-227.813};
const ARCSEC_TO_RAD=Math.PI/(180*3600),DEG_TO_RAD=Math.PI/180,RAD_TO_DEG=180/Math.PI;
function meanObliquity(T){return (23+26/60+21.448/3600)-(46.815*T+0.00059*T*T-0.001813*T*T*T)/3600;}
function precessJ2000(ra,dec,T){
  const zeta=(2306.2181*T+0.30188*T*T+0.017998*T*T*T)*ARCSEC_TO_RAD;
  const z=(2306.2181*T+1.09468*T*T+0.018203*T*T*T)*ARCSEC_TO_RAD;
  const theta=(2004.3109*T-0.42665*T*T-0.041833*T*T*T)*ARCSEC_TO_RAD;
  const A=Math.cos(dec)*Math.sin(ra+zeta),B=Math.cos(theta)*Math.cos(dec)*Math.cos(ra+zeta)-Math.sin(theta)*Math.sin(dec),C=Math.sin(theta)*Math.cos(dec)*Math.cos(ra+zeta)+Math.cos(theta)*Math.sin(dec);
  return {ra:Math.atan2(A,B)+z,dec:Math.asin(C)};
}
export function pushyaPakshaAyanamsa(jde){
  const T=(jde-2451545)/36525,years=T*100,baseDec=DELTA_CANCRI.decDegrees*DEG_TO_RAD;
  const ra=(DELTA_CANCRI.raDegrees+DELTA_CANCRI.pmRaCosDecMasYear*years/(3600000*Math.cos(baseDec)))*DEG_TO_RAD;
  const dec=(DELTA_CANCRI.decDegrees+DELTA_CANCRI.pmDecMasYear*years/3600000)*DEG_TO_RAD;
  const position=precessJ2000(ra,dec,T),epsilon=meanObliquity(T)*DEG_TO_RAD;
  const tropicalLongitude=normalizeLongitude(Math.atan2(Math.sin(position.ra)*Math.cos(epsilon)+Math.tan(position.dec)*Math.sin(epsilon),Math.cos(position.ra))*RAD_TO_DEG);
  return normalizeLongitude(tropicalLongitude-106);
}

export function getAyanamsa(mode=AYANAMSA_MODES.LAHIRI,jde){
  if(mode===AYANAMSA_MODES.LAHIRI)return {mode,value:lahiriAyanamsa(jde),label:'Lahiri / Chitrapaksha'};
  if(mode===AYANAMSA_MODES.PUSHYA_PAKSHA)return {mode,value:pushyaPakshaAyanamsa(jde),label:'Pushya-paksha'};
  throw new Error(`Unsupported ayanamsa mode: ${mode}`);
}
