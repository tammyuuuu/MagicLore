import {normalizeLongitude} from './zodiac.js';
export function validateChart(chart){
  const checks=[];const add=(name,pass,detail)=>checks.push({name,pass:Boolean(pass),detail});
  const all=[chart.lagna.tropicalLongitude,chart.lagna.siderealLongitude,...chart.grahas.flatMap(g=>[g.tropicalLongitude,g.siderealLongitude])];
  add('All longitudes 0–360',all.every(x=>x>=0&&x<360),all.find(x=>x<0||x>=360)??'OK');
  const rahu=chart.grahas.find(x=>x.name==='Rahu'),ketu=chart.grahas.find(x=>x.name==='Ketu'),separation=Math.abs(180-Math.abs(180-Math.abs(normalizeLongitude(ketu.siderealLongitude-rahu.siderealLongitude)-180)));
  add('Rahu / Ketu separation 180°',Math.abs(normalizeLongitude(ketu.siderealLongitude-rahu.siderealLongitude)-180)<1e-9,`${normalizeLongitude(ketu.siderealLongitude-rahu.siderealLongitude).toFixed(12)}°`);
  add('Nakshatra range 1–27',chart.grahas.every(x=>x.nakshatra.number>=1&&x.nakshatra.number<=27),'all grahas');
  add('Pada range 1–4',chart.grahas.every(x=>x.nakshatra.pada>=1&&x.nakshatra.pada<=4),'all grahas');
  add('Bhava range 1–12',chart.grahas.every(x=>x.bhava>=1&&x.bhava<=12),'all grahas');
  add('Vimshottari cycle 120 years',chart.dasha.totalYears===120,`${chart.dasha.totalYears} years`);
  add('Complete 12 Whole Sign houses',chart.houses.length===12&&new Set(chart.houses.map(x=>x.signIndex)).size===12,`${chart.houses.length} houses`);
  return checks;
}

