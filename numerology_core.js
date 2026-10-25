(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Numerology=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MASTERS=new Set([11,22,33]);
  function digits(value){return String(value).replace(/\D/g,'').split('').map(Number)}
  function reduceSteps(value,{preserveMasters=true}={}){const steps=[Number(value)];while(steps.at(-1)>9&&!(preserveMasters&&MASTERS.has(steps.at(-1))))steps.push(digits(steps.at(-1)).reduce((a,b)=>a+b,0));return steps}
  function reduced(value,options){return reduceSteps(value,options).at(-1)}
  function parseBirthDate(iso){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');if(!match)throw new Error('请输入有效公历生日');const year=+match[1],month=+match[2],day=+match[3];const date=new Date(Date.UTC(year,month-1,day));if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)throw new Error('请输入有效公历生日');return{year,month,day,iso:`${match[1]}-${match[2]}-${match[3]}`}}
  function birthFrequency(date){const frequency=Object.fromEntries(Array.from({length:9},(_,i)=>[i+1,0]));digits(`${date.year}${String(date.month).padStart(2,'0')}${String(date.day).padStart(2,'0')}`).forEach(n=>{if(n)frequency[n]++});return frequency}
  function calculate(iso,currentYear=new Date().getFullYear()){
    const date=parseBirthDate(iso);const raw=digits(`${date.year}${String(date.month).padStart(2,'0')}${String(date.day).padStart(2,'0')}`);const lifeSum=raw.reduce((a,b)=>a+b,0);const lifePathSteps=reduceSteps(lifeSum);const lifePath=lifePathSteps.at(-1);
    const birthdaySteps=reduceSteps(date.day);const attitudeSteps=reduceSteps(date.month+date.day);const yearSum=digits(date.year).reduce((a,b)=>a+b,0);const birthYearSteps=reduceSteps(yearSum);const month=reduced(date.month),day=reduced(date.day),year=birthYearSteps.at(-1);
    const pinnacles=[reduced(month+day),reduced(day+year),reduced(reduced(month+day)+reduced(day+year)),reduced(month+year)];
    const c1=Math.abs(month-day),c2=Math.abs(day-year);const challenges=[c1,c2,Math.abs(c1-c2),Math.abs(month-year)];
    const frequency=birthFrequency(date);const relation=frequency[lifePath]===0?'growth':frequency[lifePath]===1?'present':'reinforced';
    const universalYear=reduced(digits(currentYear).reduce((a,b)=>a+b,0),{preserveMasters:false});const personalYearSteps=reduceSteps(date.month+date.day+universalYear,{preserveMasters:false});const firstEnd=36-lifePath;const ages=[[0,firstEnd],[firstEnd+1,firstEnd+9],[firstEnd+10,firstEnd+18],[firstEnd+19,null]];
    return{date,lifePath:{value:lifePath,steps:lifePathSteps},birthday:{value:birthdaySteps.at(-1),steps:birthdaySteps},attitude:{value:attitudeSteps.at(-1),steps:attitudeSteps},birthYear:{value:birthYearSteps.at(-1),steps:birthYearSteps},birthFrequency:frequency,missing:Object.keys(frequency).filter(n=>frequency[n]===0).map(Number),coreRelation:{frequency:frequency[lifePath],relation},pinnacles,challenges,pinnacleAges:ages,personalYear:{year:currentYear,value:personalYearSteps.at(-1),steps:personalYearSteps}};
  }
  return{reduceSteps,reduced,parseBirthDate,birthFrequency,calculate};
});
