import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync('china_places.json','utf8'));
test('nationwide catalogue has 34 provincial divisions and valid coordinates for every city',()=>{
 assert.equal(rows.filter(r=>r.level===0).length,34);
 for(const r of rows.filter(r=>r.level===1)){assert.ok(Number.isFinite(r.lat)&&Number.isFinite(r.lng),r.path);assert.ok(r.lat>=-90&&r.lat<=90&&r.lng>=-180&&r.lng<=180,r.path);}
 assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
});
test('major cities, county cities and border locations are available with full paths',()=>{
 for(const path of ['北京市','广东省 深圳市','黑龙江省 绥化市','新疆维吾尔自治区 喀什地区 喀什市','台湾省 台北市','香港特别行政区','澳门特别行政区']) assert.ok(rows.some(r=>r.path===path&&r.lat!==null),path);
 assert.ok(rows.filter(r=>r.name==='朝阳区').length>1);
 const beijing=rows.find(r=>r.path==='北京市');assert.ok(Math.abs(beijing.lng-116.401)<.015&&Math.abs(beijing.lat-39.903)<.015);
});
