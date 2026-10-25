import {buildReadingStructure} from '../readingStructure.js';

export function buildGrahaInterpretationContext(chart,grahaName,existingReading=null){
  const reading=existingReading||buildReadingStructure(chart),planet=reading.planets.find(item=>item.name===grahaName);
  if(!planet)return null;
  return {chart,chartContext:{ayanamsaMode:chart.ayanamsaMode,nodeType:chart.input.nodeType,ayanamsa:chart.ayanamsa},planet,house:reading.houses.find(item=>item.house===planet.house),ruledHouseRecords:planet.ruledHouses.map(number=>reading.houses.find(item=>item.house===number)),conjunctPlanets:planet.conjunctWith.map(name=>reading.planets.find(item=>item.name===name)),incomingPlanets:[...new Set(planet.incomingAspects.map(item=>item.source))].map(name=>reading.planets.find(item=>item.name===name)),reading,nakshatraUnit:null};
}

export function buildAllGrahaInterpretationContexts(chart){const reading=buildReadingStructure(chart);return Object.fromEntries(reading.planets.map(planet=>[planet.name,buildGrahaInterpretationContext(chart,planet.name,reading)]));}
