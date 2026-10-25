import {GRAHA_DRISHTI,drishtiRule} from './metadata/drishti.js';

export function getAspectedHouse(fromHouse,aspectNumber){return ((fromHouse-1+aspectNumber-1)%12)+1;}

export function angularSeparation(first,second){
  const difference=Math.abs(first-second)%360;
  return Math.min(difference,360-difference);
}

export function buildGrahaAspects(chart){
  return chart.grahas.flatMap(source=>(GRAHA_DRISHTI[source.name]||[]).map(aspectNumber=>{
    const targetHouse=getAspectedHouse(source.bhava,aspectNumber);
    return {
      type:'graha_drishti',source:source.name,fromHouse:source.bhava,targetHouse,aspectNumber,
      targetPlanets:chart.grahas.filter(target=>target.bhava===targetHouse).map(target=>target.name),
      rule:drishtiRule(source.name,aspectNumber)
    };
  }));
}

export function buildConjunctions(chart){
  return chart.houses.map(({house})=>{
    const occupants=chart.grahas.filter(graha=>graha.bhava===house);
    if(occupants.length<2)return null;
    const separations=[];
    for(let first=0;first<occupants.length;first++)for(let second=first+1;second<occupants.length;second++)separations.push({planets:[occupants[first].name,occupants[second].name],degrees:angularSeparation(occupants[first].siderealLongitude,occupants[second].siderealLongitude)});
    return {type:'same_house',house,planets:occupants.map(item=>item.name),separations,rule:'Grahas occupy the same Whole Sign Bhava'};
  }).filter(Boolean);
}

export function buildConditions(chart){
  return chart.grahas.map(graha=>({
    planet:graha.name,
    dignity:graha.dignity?{type:graha.dignity==='Own Sign'?'own_sign':graha.dignity.toLowerCase(),label:graha.dignity,planet:graha.name,rashi:graha.sign,rule:`Traditional seven-Graha ${graha.dignity} dignity`} : null
  }));
}

export function buildRelations(chart){
  const aspects=buildGrahaAspects(chart),conjunctions=buildConjunctions(chart),conditions=buildConditions(chart);
  return {
    context:{ayanamsaMode:chart.ayanamsaMode,nodeType:chart.input.nodeType,ayanamsa:chart.ayanamsa},
    aspects,conjunctions,conditions,
    houseRelations:chart.houses.map(({house})=>({house,incomingAspects:aspects.filter(item=>item.targetHouse===house),conjunction:conjunctions.find(item=>item.house===house)||null})),
    planetRelations:chart.grahas.map(graha=>({
      planet:graha.name,
      outgoingAspects:aspects.filter(item=>item.source===graha.name),
      incomingAspects:aspects.filter(item=>item.targetPlanets.includes(graha.name)),
      conjunction:conjunctions.find(item=>item.planets.includes(graha.name))||null,
      conjunctWith:(conjunctions.find(item=>item.planets.includes(graha.name))?.planets||[]).filter(name=>name!==graha.name),
      condition:conditions.find(item=>item.planet===graha.name)
    }))
  };
}
