import {buildReadingStructure} from '../readingStructure.js';

export function buildInterpretationContext(chart,houseNumber=1,existingReading=null){
  const reading=existingReading||buildReadingStructure(chart),house=reading.houses.find(item=>item.house===houseNumber);
  return {
    chart,
    chartContext:{ayanamsaMode:chart.ayanamsaMode,nodeType:chart.input.nodeType,ayanamsa:chart.ayanamsa},
    house,
    lordPlanet:reading.planets.find(item=>item.name===house.lord),
    occupantPlanets:house.occupants.map(name=>reading.planets.find(item=>item.name===name)),
    conjunction:reading.relations.conjunctions.find(item=>item.house===houseNumber)||null,
    incomingAspects:house.incomingAspects,
    reading
  };
}

export function buildAllInterpretationContexts(chart){const reading=buildReadingStructure(chart);return Object.fromEntries(reading.houses.map(house=>[house.house,buildInterpretationContext(chart,house.house,reading)]));}
