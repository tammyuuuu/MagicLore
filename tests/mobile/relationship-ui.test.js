import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../../',import.meta.url);
function setup(){
 const elements=new Map(),store=new Map();
 const node=()=>({innerHTML:'',textContent:'',dataset:{},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){}});
 const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
 const tabs=['common','complement','difference'].map(key=>({...node(),dataset:{relTab:key}}));
 get('matchView').querySelectorAll=selector=>selector==='[data-rel-tab]'?tabs:[];
 const context={document:{getElementById:get,querySelector:()=>node()},MutationObserver:class{observe(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},console};context.window=context;context.scrollTo=()=>{};vm.createContext(context);
 for(const f of ['numerology_core.js','numerology_content.js','relationship_content.js','relationship_engine.js','relationship_ui.js'])vm.runInContext(readFileSync(new URL(f,root),'utf8'),context);
 return {context,get,tabs,store};
}
test('合盘显示数字对比和三个标签，不再渲染人生阶段及长报告',()=>{
 const {context:c,get,tabs}=setup();c.RelationshipUI.openDates('2000-01-01','2000-01-01',[{id:'a',name:'人物甲'},{id:'b',name:'人物乙'}]);const html=get('matchView').innerHTML;assert.ok(html.includes('nr-core-pair'));assert.ok(html.includes('人物甲'));assert.ok(!html.includes('人生阶段'));assert.ok(!html.includes('relationship-quick'));assert.ok(!html.includes('rel-section'));
 for(const tab of tabs){tab.onclick();assert.ok(get('nrRelationPanel').innerHTML.length>20);assert.ok(!get('nrRelationPanel').innerHTML.includes('undefined'));}
});
test('不同组合解读、流年切换及人物关联保存沿用原始引擎',()=>{
 const {context:c,get,tabs,store}=setup();for(const dates of [['1995-02-07','2000-02-09'],['2000-01-01','2001-11-22']]){c.RelationshipUI.openDates(...dates,[{id:'a',name:'A'},{id:'b',name:'B'}]);for(const t of tabs){t.onclick();assert.ok(!get('nrRelationPanel').innerHTML.includes('undefined'));}const year=new Date().getFullYear();get('relNext').onclick();assert.ok(get('relationshipYear').innerHTML.includes(String(year+1)));get('relPrev').onclick();assert.ok(get('relationshipYear').innerHTML.includes(String(year)));get('savePair').onclick();const saved=JSON.parse(store.get('destiny_relationship_archives_v1'));assert.equal(saved[0].isoA,dates[0]);assert.equal(saved[0].personAId,'a');assert.equal(saved[0].title,'A × B');}
});

test('相同生日合并核心数字和流年，不生成互补点或差异',()=>{
 const {context:c,get,tabs}=setup();c.RelationshipUI.openDates('2000-01-01','2000-01-01');const r=c.RelationshipEngine.analyze('2000-01-01','2000-01-01',2026);assert.equal(r.sameStructure,true);assert.equal(r.bridges.length,0);assert.equal(r.tension.length,0);assert.equal(r.complement.length,0);assert.equal((get('matchView').innerHTML.match(/class="nr-life-number"/g)||[]).length,1);assert.ok(get('matchView').innerHTML.includes('双方流年相同'));
 tabs[0].onclick();const common=get('nrRelationPanel').innerHTML;assert.equal((common.match(/class="nr-point"/g)||[]).length,1);for(const t of tabs.slice(1)){t.onclick();assert.ok(get('nrRelationPanel').innerHTML.includes('暂无明显'));assert.ok(!get('nrRelationPanel').innerHTML.includes('nr-point'));}
 for(let i=0;i<3;i++){get('relNext').onclick();assert.equal((get('relationshipYear').innerHTML.match(/class="nr-merged"/g)||[]).length,1);}
});
test('不同生日只比较对应维度，栏目解读不重复',()=>{
 const {context:c,get,tabs}=setup();for(const [a,b]of [['1995-02-07','2000-02-09'],['1988-08-08','2001-07-17'],['1991-01-01','1991-10-01'],['2000-01-01','2000-01-02']]){
 c.RelationshipUI.openDates(a,b);const r=c.RelationshipEngine.analyze(a,b,2026);for(const item of r.relations)assert.equal(item.sourceA,item.sourceB);const briefs=[];for(const t of tabs){t.onclick();const html=get('nrRelationPanel').innerHTML;for(const article of html.split('<article class="nr-point">').slice(1)){const brief=article.match(/<p>(.*?)<\/p>/)?.[1];if(brief)briefs.push(brief);}}assert.equal(new Set(briefs).size,briefs.length);
 }
});

test('共同数字直接显示含义，不显示数字依据或结构免责声明',()=>{
 const {context:c,get,tabs}=setup();c.RelationshipUI.openDates('2000-01-01','2000-01-01');tabs[0].onclick();const html=get('nrRelationPanel').innerHTML;for(const title of ['1 · 开创','2 · 调和','4 · 建设'])assert.ok(html.includes(title));assert.ok(html.includes('自主决定与主动开始'));assert.ok(!html.includes('数字依据'));assert.ok(!html.includes('不能据此'));assert.ok(!get('matchView').innerHTML.includes('不能据此'));
});
