import test from 'node:test';
import assert from 'node:assert/strict';
import {placePlanetSymbols} from '../../src/western/planetSymbolLayout.js';
const point=(a,r)=>[310+r*Math.cos(a*Math.PI/180),310+r*Math.sin(a*Math.PI/180)];
for(const angles of [[270,271],[359,0,1],[10,11,12,13,14],[0,0,0,0,0,0,0,0,0,0]])test('符号避让不改真实黄经 '+angles.join(','),()=>{const input=angles.map((longitude,i)=>({name:String(i),longitude})),before=JSON.stringify(input),layout=placePlanetSymbols(input,point);assert.equal(JSON.stringify(input),before);for(let i=0;i<layout.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(layout[i].position[0]-layout[j].position[0],layout[i].position[1]-layout[j].position[1])>=38);});
