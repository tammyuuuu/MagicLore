import {aspectOrbs} from './aspectOrbs.js';
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const labels={0:'合相',60:'六合',90:'刑相',120:'拱相',180:'对冲'};
const planets=new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
export function planetDetails(chart,name,{natal=null,housesFromNatal=true}={}){
 const planet=chart.planets.find(p=>p.name===name);if(!planet)return null;
 const cusps=natal&&housesFromNatal?natal.cusps:chart.cusps,limits=aspectOrbs(chart.input);
 const ruledHouses=cusps.flatMap((c,i)=>rulers[Math.floor(((c%360)+360)%360/30)]===name?[i+1]:[]);
 let aspects;
 if(natal){const limit=chart.input.transitOrb??3;aspects=[];for(const p of [...natal.planets,{name:'MC',longitude:natal.mc}].filter(p=>planets.has(p.name)||p.name==='MC')){const gap=Math.abs(((planet.longitude-p.longitude+540)%360)-180);for(const angle of [0,60,90,120,180]){const orb=Math.abs(gap-angle);if(orb<=limit)aspects.push({other:p.name,angle,label:labels[angle],orb,limit,scope:'natal'});}}}
 else aspects=chart.aspects.filter(a=>a.a===name||a.b===name).map(a=>({other:a.a===name?a.b:a.a,angle:a.angle,label:a.label,orb:a.orb,limit:limits[a.angle],scope:'chart'}));
 return {...planet,ruledHouses,aspects:aspects.sort((a,b)=>a.orb-b.orb),transit:!!natal};
}
