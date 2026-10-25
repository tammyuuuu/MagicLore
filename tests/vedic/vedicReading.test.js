import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateVedicChart} from '../../src/vedic/calculateVedicChart.js';
import {buildHouseReadings,buildPlanetReadings,buildReadingStructure} from '../../src/vedic/readingStructure.js';

const input={date:'1999-07-07',time:'06:30:00',place:'Suihua',latitude:46.6395,longitude:126.9951,timezoneOffset:'+08:00'};
const chart=calculateVedicChart(input,{ayanamsaMode:'lahiri',nodeType:'true'});

test('House maps to its calculated Rashi',()=>{const first=buildHouseReadings(chart)[0];assert.equal(first.house,1);assert.equal(first.rashi,'Cancer');});
test('House maps to the traditional Rashi lord',()=>{assert.equal(buildHouseReadings(chart)[0].lord,'Moon');});
test('House lord maps to its calculated located house',()=>{assert.equal(buildHouseReadings(chart)[0].lordHouse,9);});
test('House occupants come only from calculated Bhava placements',()=>{assert.deepEqual(buildHouseReadings(chart)[0].occupants,['Mercury','Rahu']);});
test('Planet maps back to every house it rules',()=>{const mars=buildPlanetReadings(chart).find(item=>item.name==='Mars');assert.deepEqual(mars.ruledHouses,[5,10]);});
test('dual-sign rulers produce two ruled houses',()=>{const mercury=buildPlanetReadings(chart).find(item=>item.name==='Mercury');assert.deepEqual(mercury.ruledHouses,[3,12]);});
test('Sun and Moon each rule one house',()=>{const planets=buildPlanetReadings(chart);assert.deepEqual(planets.find(item=>item.name==='Sun').ruledHouses,[2]);assert.deepEqual(planets.find(item=>item.name==='Moon').ruledHouses,[1]);});
test('Rahu and Ketu do not enter the traditional house-lord mapping',()=>{const planets=buildPlanetReadings(chart);assert.deepEqual(planets.find(item=>item.name==='Rahu').ruledHouses,[]);assert.deepEqual(planets.find(item=>item.name==='Ketu').ruledHouses,[]);});
test('Ayanamsa switching rebuilds reading data from the selected chart',()=>{const lahiri=buildReadingStructure(chart),pushya=buildReadingStructure(calculateVedicChart(input,{ayanamsaMode:'pushya_paksha',nodeType:'true'}));assert.equal(lahiri.planets.find(item=>item.name==='Moon').pada,3);assert.equal(pushya.planets.find(item=>item.name==='Moon').pada,4);assert.notEqual(lahiri.planets.find(item=>item.name==='Moon').longitude,pushya.planets.find(item=>item.name==='Moon').longitude);});
test('a rebuilt reading structure retains no reference to an older chart',()=>{const first=buildReadingStructure(chart),nextChart=calculateVedicChart(input,{ayanamsaMode:'pushya_paksha',nodeType:'mean'}),next=buildReadingStructure(nextChart);assert.equal(next.chart,nextChart);assert.notEqual(next.chart,first.chart);assert.notEqual(next.houses,first.houses);assert.notEqual(next.planets,first.planets);});
