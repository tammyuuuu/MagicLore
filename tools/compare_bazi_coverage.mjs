import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const before=JSON.parse(await fs.readFile(process.argv[2]||'maintenance/bazi-coverage-before.json','utf8'));
const after=JSON.parse(await fs.readFile(process.argv[3]||'maintenance/bazi-coverage-after.json','utf8'));
assert.equal(before.rows.length,after.rows.length);
const changes={unchanged:0,changedWithEvidence:0,newlyAvailable:0,lost:0};
for(let i=0;i<after.rows.length;i++){
 const a=after.rows[i],b=before.rows[i];assert.equal(a.id,b.id);assert.equal(a.day,b.day);
 if(b.special==='established'){assert.equal(a.special,b.special);assert.equal(a.patterns,b.patterns);}
 for(let j=0;j<a.periods.length;j++){
  const p=a.periods[j],q=b.periods[j];assert.equal(p.pillar,q.pillar);
  for(const t of ['overall','career','wealth','relationship']){
   const x=q.scores[t],y=p.scores[t];
   if(x===null&&y!==null)changes.newlyAvailable++;
   else if(x!==null&&y===null)changes.lost++;
   else if(x!==null&&y!==x){changes.changedWithEvidence++;assert.notDeepEqual(p.contributions[t],q.contributions[t]);}
   else if(x!==null)changes.unchanged++;
   if(y!==null){assert.ok(p.contributions[t].length);assert.equal(y,Math.round(Math.max(0,Math.min(100,50+p.contributions[t].reduce((s,c)=>s+c.value,0)))*10)/10);}
  }
 }
}
const comparison={sampleCharts:after.summary.charts,samplePeriods:after.summary.periods,before:before.summary,after:after.summary,changes};
await fs.writeFile(process.argv[4]||'maintenance/bazi-coverage-comparison.json',JSON.stringify(comparison,null,2));console.log(JSON.stringify(comparison,null,2));
