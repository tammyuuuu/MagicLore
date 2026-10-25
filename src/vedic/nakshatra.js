import {normalizeLongitude} from './zodiac.js';
export const NAKSHATRAS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
export const NAKSHATRA_SPAN=360/27;
export const PADA_SPAN=NAKSHATRA_SPAN/4;
const boundaryFloor=value=>{const nearest=Math.round(value);return Math.abs(value-nearest)<1e-12?nearest:Math.floor(value);};
export function getNakshatra(value){
  const longitude=normalizeLongitude(value),index=Math.min(26,boundaryFloor(longitude/NAKSHATRA_SPAN));
  const within=longitude-index*NAKSHATRA_SPAN;
  return {index,number:index+1,name:NAKSHATRAS[index],pada:Math.min(4,boundaryFloor(within/PADA_SPAN)+1),withinDegrees:Math.abs(within)<1e-12?0:within};
}
