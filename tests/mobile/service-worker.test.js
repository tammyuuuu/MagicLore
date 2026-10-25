import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto,createHash} from 'node:crypto';
const code=readFileSync(new URL('../../sw.js',import.meta.url),'utf8');
function environment({fail=false,previous=false,scope='/'}={}){
  const handlers={},cacheMap=new Map(),requests=[];let activated=false,claimed=false;
  const url=k=>typeof k==='string'?new URL(k,'https://example.test/').href:k.url||k.href;
  const cache=()=>{const data=new Map();return {data,put:async(k,v)=>data.set(url(k),v.clone()),match:async k=>data.get(url(k))?.clone(),keys:async()=>[...data.keys()].map(k=>new Request(k))};};
  const caches={open:async key=>{if(!cacheMap.has(key))cacheMap.set(key,cache());return cacheMap.get(key);},keys:async()=>[...cacheMap.keys()],delete:async key=>cacheMap.delete(key)};
  if(previous){const old=cache();old.data.set('https://example.test/bazi_web.html',new Response('old module'));cacheMap.set('magiclore-%2F-previous-visited',old);}
  const hash=createHash('sha256').update('ok').digest('hex');
  const manifest={files:new Proxy({}, {get:()=>hash}),modules:{'bazi_web.html':['bazi_web.html','bazi_app.js']}};
  const fetch=async request=>{const path=new URL(url(request)).pathname;requests.push(path);if(path.endsWith('/asset-manifest.json'))return {ok:true,clone:()=>({json:async()=>manifest})};if(fail&&path==='/bazi_app.js')return new Response('bad deployment',{status:503});return new Response('ok');};
  vm.runInNewContext(code,{self:{location:{href:new URL('sw.js','https://example.test'+scope).href},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:()=>activated=true,clients:{claim:async()=>claimed=true}},caches,fetch,URL,Request,Response,crypto:webcrypto,Uint8Array,Set,Promise,Error});
  return {cacheMap,requests,handlers,get activated(){return activated;},get claimed(){return claimed;},run(name,data={}){let pending;handlers[name]({...data,waitUntil:p=>pending=p});return pending;}};
}
test('首次安装仅请求轻量外壳，不下载未访问的排盘引擎',async()=>{const env=environment();await env.run('install');assert.ok(!env.requests.includes('/bazi_app.js'));assert.ok(!env.requests.includes('/china_places.js'));assert.equal(env.activated,false);});
test('更新先校验曾访问模块的完整依赖，随后才允许激活',async()=>{const env=environment({previous:true});await env.run('install');assert.ok(env.requests.includes('/bazi_app.js'));assert.equal(env.activated,false);env.handlers.message({data:{type:'ACTIVATE'}});assert.equal(env.activated,true);await env.run('activate');assert.equal(env.claimed,true);assert.ok(!env.cacheMap.has('magiclore-%2F-previous-visited'));});
test('不完整发布使安装失败，保留旧版本缓存和控制权',async()=>{const env=environment({previous:true,fail:true});await assert.rejects(env.run('install'));assert.equal(env.activated,false);assert.equal(env.claimed,false);assert.ok(env.cacheMap.has('magiclore-%2F-previous-visited'));});
test('项目子路径下全部预缓存请求和缓存命名均留在本项目作用域',async()=>{const env=environment({scope:'/MagicLore/'});await env.run('install');assert.ok(env.requests.every(path=>path.startsWith('/MagicLore/')));assert.ok([...env.cacheMap.keys()].every(key=>key.startsWith('magiclore-%2FMagicLore%2F-')));});
