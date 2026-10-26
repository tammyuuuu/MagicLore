import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateWesternChart,calculateWesternTransit} from '../../src/western/calculateWesternChart.js';
import {calculateRelocation} from '../../src/western/relocation.js';
import {planetDetails} from '../../src/western/planetDetails.js';
const input=JSON.parse(fs.readFileSync(new URL('./swiss-fixtures.json',import.meta.url),'utf8'))[0];
test('行星详情逐字沿用当前盘位置与相位，四种宫制均适用',()=>{
 const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
 for(const system of ['placidus','alcabitius','whole','equal']){const chart=calculateWesternChart({...input,system}),before=JSON.stringify(chart);for(const p of chart.planets.slice(0,10)){const d=planetDetails(chart,p.name);assert.equal(d.longitude,p.longitude);assert.equal(d.house,p.house);assert.deepEqual(d.ruledHouses,chart.cusps.flatMap((c,i)=>rulers[Math.floor(c/30)]===p.name?[i+1]:[]));assert.equal(d.aspects.length,chart.aspects.filter(a=>a.a===p.name||a.b===p.name).length);for(const a of d.aspects)assert.ok(a.orb<=a.limit);}assert.equal(JSON.stringify(chart),before);}
});
test('宫制与容许度更新后详情不使用陈旧数据',()=>{
 const wide=calculateWesternChart({...input,aspectOrbs:{0:15,60:15,90:15,120:15,180:15}}),tight=calculateWesternChart({...input,aspectOrbs:{0:0,60:0,90:0,120:0,180:0}});let count=0;for(const p of wide.planets.slice(0,10)){count+=planetDetails(wide,p.name).aspects.length;assert.equal(planetDetails(tight,p.name).aspects.length,0);}assert.ok(count>0);assert.equal(planetDetails(wide,'unknown'),null);
});
test('重置盘详情使用目的地宫位，保持同一时刻的黄经',()=>{
 const {natal,relocated}=calculateRelocation(input,{place:'伦敦',latitude:51.5074,longitude:-.1278});let changed=false;for(const p of natal.planets.slice(0,10)){const d=planetDetails(relocated,p.name);assert.equal(d.longitude,p.longitude);assert.equal(d.house,relocated.planets.find(q=>q.name===p.name).house);if(d.house!==p.house)changed=true;}assert.ok(changed);
});
test('行运详情以本命宫位及本命相位对象计算，包含MC和配置容许度',()=>{
 const natal=calculateWesternChart(input),target={...input,date:'2026-10-26',transitOrb:15},current=calculateWesternTransit(input,target);let count=0;for(const p of current.planets.slice(0,10)){const d=planetDetails(current,p.name,{natal});assert.equal(d.house,p.house);assert.equal(d.transit,true);for(const a of d.aspects){const other=a.other==='MC'?natal.mc:natal.planets.find(q=>q.name===a.other).longitude;const gap=Math.abs(((p.longitude-other+540)%360)-180);assert.ok(Math.abs(a.orb-Math.abs(gap-a.angle))<1e-9);assert.equal(a.limit,15);assert.equal(a.scope,'natal');count++;}}
 assert.ok(count>0);const tight=calculateWesternTransit(input,{...target,transitOrb:0});assert.ok(tight.planets.slice(0,10).every(p=>planetDetails(tight,p.name,{natal}).aspects.length===0));
});

test('独立行运使用自身宫位宫主关系，但相位仍可对照本命',()=>{
 const natal=calculateWesternChart(input),current=calculateWesternChart({...input,date:'2026-10-26',system:'whole'});
 for(const p of current.planets.slice(0,10)){const independent=planetDetails(current,p.name,{natal,housesFromNatal:false}),standalone=planetDetails(current,p.name);assert.equal(independent.house,p.house);assert.deepEqual(independent.ruledHouses,standalone.ruledHouses);assert.ok(independent.aspects.every(a=>a.scope==='natal'));}
});
