import {getNakshatra,NAKSHATRA_SPAN} from './nakshatra.js';
export const DASHA_SEQUENCE=[['Ketu',7],['Venus',20],['Sun',6],['Moon',10],['Mars',7],['Rahu',18],['Jupiter',16],['Saturn',19],['Mercury',17]];
const YEAR_DAYS=365.2425;
const addYears=(date,years)=>new Date(date.getTime()+years*YEAR_DAYS*86400000);
export function vimshottariMahadasha(moonLongitude,birthDate){
  const nakshatra=getNakshatra(moonLongitude),sequenceIndex=nakshatra.index%9,[lord,durationYears]=DASHA_SEQUENCE[sequenceIndex];
  const elapsedFraction=nakshatra.withinDegrees/NAKSHATRA_SPAN;
  const elapsedYears=durationYears*elapsedFraction,remainingYears=durationYears-elapsedYears;
  const currentStart=addYears(birthDate,-elapsedYears),currentEnd=addYears(birthDate,remainingYears);
  const timeline=[];let start=currentStart;
  for(let i=0;i<9;i++){const [itemLord,years]=DASHA_SEQUENCE[(sequenceIndex+i)%9],end=addYears(start,years);timeline.push({lord:itemLord,start,end,durationYears:years});start=end;}
  return {nakshatra,currentLord:lord,durationYears,elapsedYears,remainingYears,currentStart,currentEnd,timeline,totalYears:timeline.reduce((s,x)=>s+x.durationYears,0)};
}

