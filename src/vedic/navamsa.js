import {normalizeLongitude,splitLongitude} from './zodiac.js';
import {wholeSignHouses,bhavaForSign} from './houses.js';
export function navamsaLongitude(longitude){return normalizeLongitude(longitude*9);}
export function calculateNavamsa(chart){
 const longitude=navamsaLongitude(chart.lagna.siderealLongitude),lagna={...splitLongitude(longitude),siderealLongitude:longitude};
 return {...chart,varga:'D9',lagna,houses:wholeSignHouses(lagna.signIndex),grahas:chart.grahas.map(p=>{const transformed=navamsaLongitude(p.siderealLongitude),position=splitLongitude(transformed);return {...p,...position,siderealLongitude:transformed,bhava:bhavaForSign(position.signIndex,lagna.signIndex)};})};
}
