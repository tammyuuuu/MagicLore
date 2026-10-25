import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateVedicChart} from '../../src/vedic/calculateVedicChart.js';
import {GRAHA_DRISHTI} from '../../src/vedic/metadata/drishti.js';
import {getAspectedHouse,angularSeparation,buildGrahaAspects,buildConjunctions,buildRelations} from '../../src/vedic/relations.js';
import {dignityFor} from '../../src/vedic/dignities.js';

const input={date:'1999-07-07',time:'06:30:00',place:'Suihua',latitude:46.6395,longitude:126.9951,timezoneOffset:'+08:00'};
const chart=calculateVedicChart(input,{ayanamsaMode:'lahiri',nodeType:'true'});
const aspects=buildGrahaAspects(chart);
const targets=name=>aspects.filter(item=>item.source===name).map(item=>[item.aspectNumber,item.targetHouse]);

test('all seven traditional Grahas include the 7th aspect',()=>{for(const name of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'])assert.ok(GRAHA_DRISHTI[name].includes(7));});
test('Mars uses 4th, 7th and 8th aspects',()=>{assert.deepEqual(GRAHA_DRISHTI.Mars,[4,7,8]);assert.deepEqual(targets('Mars'),[[4,7],[7,10],[8,11]]);});
test('Jupiter uses 5th, 7th and 9th aspects',()=>{assert.deepEqual(GRAHA_DRISHTI.Jupiter,[5,7,9]);assert.deepEqual(targets('Jupiter'),[[5,2],[7,4],[9,6]]);});
test('Saturn uses 3rd, 7th and 10th aspects',()=>{assert.deepEqual(GRAHA_DRISHTI.Saturn,[3,7,10]);assert.deepEqual(targets('Saturn'),[[3,12],[7,4],[10,7]]);});
test('aspect house calculation wraps across the 12th house',()=>{assert.equal(getAspectedHouse(12,7),6);assert.equal(getAspectedHouse(10,5),2);assert.equal(getAspectedHouse(4,8),11);});
test('Rahu and Ketu have no Graha Drishti in V1',()=>{assert.equal(GRAHA_DRISHTI.Rahu,null);assert.equal(GRAHA_DRISHTI.Ketu,null);assert.equal(aspects.some(item=>['Rahu','Ketu'].includes(item.source)),false);});
test('house relations contain incoming aspects',()=>{const third=buildRelations(chart).houseRelations.find(item=>item.house===3);assert.deepEqual(third.incomingAspects.map(item=>item.source),['Moon']);});
test('planet relations contain incoming aspects from target house relations',()=>{const mars=buildRelations(chart).planetRelations.find(item=>item.planet==='Mars');assert.deepEqual(mars.incomingAspects.map(item=>item.source),['Jupiter','Saturn']);});
test('two Grahas in one Whole Sign house form a conjunction',()=>{const first=buildConjunctions(chart).find(item=>item.house===1);assert.deepEqual(first.planets,['Mercury','Rahu']);assert.equal(first.type,'same_house');});
test('three or more Grahas in one house form one grouped conjunction with every pair separation',()=>{const synthetic={houses:Array.from({length:12},(_,i)=>({house:i+1})),grahas:[{name:'Sun',bhava:1,siderealLongitude:1},{name:'Moon',bhava:1,siderealLongitude:2},{name:'Mars',bhava:1,siderealLongitude:3}]};const relation=buildConjunctions(synthetic)[0];assert.equal(relation.planets.length,3);assert.equal(relation.separations.length,3);});
test('Grahas in different houses do not form a conjunction',()=>{const relation=buildConjunctions(chart);assert.equal(relation.some(item=>item.planets.includes('Moon')&&item.planets.includes('Mars')),false);});
test('angular separation handles the 0 and 360 boundary',()=>{assert.equal(angularSeparation(0,360),0);assert.equal(angularSeparation(359,1),2);assert.equal(angularSeparation(10,350),20);});
test('Own Sign reuses traditional Rashi rulers including dual rulership',()=>{assert.equal(dignityFor('Mars',0),'Own Sign');assert.equal(dignityFor('Mars',7),'Own Sign');assert.equal(dignityFor('Saturn',9),'Own Sign');assert.equal(dignityFor('Saturn',10),'Own Sign');});
test('traditional seven-Graha exaltations are recognized',()=>{assert.equal(dignityFor('Sun',0),'Exaltation');assert.equal(dignityFor('Moon',1),'Exaltation');assert.equal(dignityFor('Venus',11),'Exaltation');});
test('traditional seven-Graha debilitations are recognized',()=>{assert.equal(dignityFor('Sun',6),'Debilitation');assert.equal(dignityFor('Mars',3),'Debilitation');assert.equal(dignityFor('Saturn',0),'Debilitation');});
test('Rahu and Ketu receive no basic dignity',()=>{assert.equal(dignityFor('Rahu',0),null);assert.equal(dignityFor('Ketu',6),null);});
test('Ayanamsa switching rebuilds all relations from the new chart',()=>{const lahiri=buildRelations(chart),pushyaChart=calculateVedicChart(input,{ayanamsaMode:'pushya_paksha',nodeType:'true'}),pushya=buildRelations(pushyaChart);assert.notEqual(pushya,lahiri);assert.notEqual(pushya.aspects,lahiri.aspects);assert.notEqual(pushya.conjunctions,lahiri.conjunctions);assert.notEqual(pushya.conditions,lahiri.conditions);assert.equal(lahiri.context.ayanamsaMode,'lahiri');assert.equal(pushya.context.ayanamsaMode,'pushya_paksha');assert.notEqual(lahiri.context.ayanamsa,pushya.context.ayanamsa);});
