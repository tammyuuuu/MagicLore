import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateWesternChart,calculateWesternTransit} from '../../src/western/calculateWesternChart.js';
import {classicalConditions} from '../../src/western/classicalNarrative.js';
import {termRuler,faceRuler,mirroredPoints,shortPosition,classicalTableData,aspectMatrix,chartDataHTML} from '../../src/western/chartViews.js';
const input=JSON.parse(fs.readFileSync(new URL('./swiss-fixtures.json',import.meta.url),'utf8'))[0];
test('埃及界和迦勒底面在精确边界按后一区段计算',()=>{
 assert.equal(termRuler(0),'Jupiter');assert.equal(termRuler(5.999999),'Jupiter');assert.equal(termRuler(6),'Venus');assert.equal(termRuler(12),'Mercury');assert.equal(termRuler(30),'Venus');assert.equal(termRuler(329.999),'Saturn');assert.equal(termRuler(330),'Venus');assert.equal(termRuler(342),'Jupiter');assert.equal(termRuler(360),'Jupiter');
 assert.equal(faceRuler(0),'Mars');assert.equal(faceRuler(9.99999),'Mars');assert.equal(faceRuler(10),'Sun');assert.equal(faceRuler(20),'Venus');assert.equal(faceRuler(30),'Mercury');assert.equal(faceRuler(120),'Saturn');
});
test('映点几何满足对称及反映点相差180度，度分进位不跨错星座',()=>{
 for(const l of [0,10,90,165,180,270,359.999]){const m=mirroredPoints(l);assert.ok(Math.abs(((l+m.antiscion)%360)-180)<1e-8);assert.ok(Math.abs((m.antiscion+180)%360-m.contraAntiscion)<1e-8);assert.ok(Math.abs(mirroredPoints(m.antiscion).antiscion-l)<1e-8);}
 assert.ok(shortPosition(29.9999).includes('♉'));assert.ok(shortPosition(359.9999).includes('♈'));assert.ok(shortPosition(12.5).includes('12°30′'));
});
test('古典七星状态表复用已有判断，不改变盘数据和宫制',()=>{
 for(const system of ['placidus','alcabitius','whole','equal']){const c=calculateWesternChart({...input,astrologyMode:'classical',system}),before=JSON.stringify(c),table=classicalTableData(c),old=classicalConditions(c);assert.equal(table.rows.length,7);for(const r of table.rows){const s=old.states[r.name];assert.equal(r.house,s.p.house);assert.equal(r.longitude,s.p.longitude);assert.equal(r.dignities.includes('庙'),s.dignities.includes('入庙'));assert.equal(r.dignities.includes('旺'),s.dignities.includes('擢升'));assert.equal(r.dignities.includes('失势'),s.detriment);assert.equal(r.dignities.includes('落陷'),s.fall);assert.equal(r.status.includes('得时'),s.sect===true);if(s.solar)assert.ok(r.status.includes(s.solar==='灼伤'?'燃烧':s.solar));}assert.equal(JSON.stringify(c),before);const html=chartDataHTML(c);assert.equal((html.match(/<col style=/g)||[]).length,6);assert.ok(!html.includes('黄经'));assert.ok(!html.includes('赤经'));}
});
test('现代相位矩阵只展示已有相位，更新容许度后数据同步',()=>{
 const chart=calculateWesternChart(input),matrix=aspectMatrix(chart);assert.equal(matrix.rows.length,10);assert.equal(matrix.cells.flat().filter(Boolean).length,chart.aspects.length);for(let i=0;i<10;i++)for(let j=i;j<10;j++)assert.equal(matrix.cells[i][j],null);const tight=aspectMatrix(calculateWesternChart({...input,aspectOrbs:{0:0,60:0,90:0,120:0,180:0}}));assert.equal(tight.cells.flat().filter(Boolean).length,0);
 const natal=calculateWesternChart(input),transit=calculateWesternTransit(input,{...input,date:'2026-10-26'}),cross=aspectMatrix(transit,{natal});assert.equal(cross.rows.length,10);assert.equal(cross.columns.length,10);assert.ok(cross.cells.flat().filter(Boolean).every(a=>a.scope==='natal'));
});
