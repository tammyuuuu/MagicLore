import {getHouseMetadata} from './metadata/houses.js';
import {GRAHA_METADATA} from './metadata/grahas.js';
import {RASHI_RULERS} from './metadata/rulers.js';
import {getRashiMetadata} from './metadata/rashis.js';
import {buildRelations} from './relations.js';

export function buildHouseReadings(chart,relations=buildRelations(chart)){
  const placements=Object.fromEntries(chart.grahas.map(graha=>[graha.name,graha]));
  const readings=chart.houses.map(house=>{
    const lord=RASHI_RULERS[house.sign],lordPlacement=placements[lord];
    return {
      house:house.house,
      houseMeta:getHouseMetadata(house.house),
      rashi:house.sign,
      rashiMeta:getRashiMetadata(house.sign),
      lord,
      lordHouse:lordPlacement?.bhava??null,
      occupants:chart.grahas.filter(graha=>graha.bhava===house.house).map(graha=>graha.name),
      incoming:[],
      incomingAspects:relations.houseRelations.find(item=>item.house===house.house).incomingAspects,
      conjunction:relations.houseRelations.find(item=>item.house===house.house).conjunction
    };
  });
  for(const source of readings){
    const target=readings.find(item=>item.house===source.lordHouse);
    if(target)target.incoming.push({fromHouse:source.house,lord:source.lord});
  }
  return readings;
}

export function buildPlanetReadings(chart,houseReadings,relations=buildRelations(chart)){
  if(!houseReadings)houseReadings=buildHouseReadings(chart,relations);
  return chart.grahas.map(graha=>({
    name:graha.name,
    meta:GRAHA_METADATA[graha.name],
    rashi:graha.sign,
    rashiMeta:getRashiMetadata(graha.sign),
    house:graha.bhava,
    nakshatra:graha.nakshatra.name,
    pada:graha.nakshatra.pada,
    longitude:graha.siderealLongitude,
    retrograde:graha.retrograde,
    condition:relations.planetRelations.find(item=>item.planet===graha.name).condition,
    outgoingAspects:relations.planetRelations.find(item=>item.planet===graha.name).outgoingAspects,
    incomingAspects:relations.planetRelations.find(item=>item.planet===graha.name).incomingAspects,
    conjunction:relations.planetRelations.find(item=>item.planet===graha.name).conjunction,
    conjunctWith:relations.planetRelations.find(item=>item.planet===graha.name).conjunctWith,
    ruledHouses:houseReadings.filter(house=>house.lord===graha.name).map(house=>house.house)
  }));
}

export function buildReadingStructure(chart){
  const relations=buildRelations(chart),houses=buildHouseReadings(chart,relations);
  return {chart,relations,houses,planets:buildPlanetReadings(chart,houses,relations)};
}
