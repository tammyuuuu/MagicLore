import {SIGNS} from './zodiac.js';
export function wholeSignHouses(lagnaSignIndex){return Array.from({length:12},(_,i)=>({house:i+1,signIndex:(lagnaSignIndex+i)%12,sign:SIGNS[(lagnaSignIndex+i)%12]}));}
export function bhavaForSign(signIndex,lagnaSignIndex){return ((signIndex-lagnaSignIndex+12)%12)+1;}

