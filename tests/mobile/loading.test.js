import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {resolveWallTime,validateTimeZone} from '../../profile-time.js';
const read=name=>readFileSync(new URL('../../'+name,import.meta.url),'utf8');

test('reused zone formatters retain date-specific DST and do not cache invalid zones',()=>{
 const original=Intl.DateTimeFormat;let calls=0;
 Intl.DateTimeFormat=new Proxy(original,{construct(target,args){calls++;return Reflect.construct(target,args);}});
 try{
  for(let i=0;i<100;i++)validateTimeZone('America/Anchorage');
  assert.equal(calls,1);
  assert.equal(resolveWallTime('2020-01-15','12:00',{iana:'America/Anchorage'}).offset,'-09:00');
  assert.equal(resolveWallTime('2020-07-15','12:00',{iana:'America/Anchorage'}).offset,'-08:00');
  assert.equal(calls,1);
  assert.throws(()=>validateTimeZone('Unknown/Invalid'));assert.throws(()=>validateTimeZone('Unknown/Invalid'));assert.equal(calls,3);
 }finally{Intl.DateTimeFormat=original;}
});

test('place catalogue is requested on editor use, coalesces requests and permits retry',async()=>{
 const scripts=[],events=new Map(),source=read('place-data-loader.js');
 const ctx={URL,Promise,Array,Event,console,location:{hash:'#report'},document:{currentScript:{src:'https://example.test/lore/place-data-loader.js'},createElement:()=>({remove(){}}),head:{append:s=>scripts.push(s)},addEventListener:(name,fn)=>events.set(name,fn)}};
 ctx.window=ctx;ctx.addEventListener=(name,fn)=>events.set(name,fn);ctx.dispatchEvent=()=>{};
 vm.runInNewContext(source,ctx);assert.equal(scripts.length,0);
 let needed=false;ctx.magicLoreWhenPlacesNeeded().then(()=>needed=true);
 ctx.location.hash='#natal';events.get('hashchange')();await Promise.resolve();assert.equal(needed,true);assert.equal(scripts.length,1);
 assert.equal(scripts[0].src,'https://example.test/lore/china_places.js');
 const a=ctx.magicLoreLoadPlaces(),b=ctx.magicLoreLoadPlaces();assert.equal(a,b);
 ctx.CHINA_BIRTHPLACES=[{id:'11'}];scripts[0].onload();assert.equal(await a,ctx.CHINA_BIRTHPLACES);
 delete ctx.CHINA_BIRTHPLACES;ctx.location.hash='#report';vm.runInNewContext(source,ctx);
 const failure=ctx.magicLoreLoadPlaces();scripts[1].onerror();await assert.rejects(failure,/未能加载/);
 const retry=ctx.magicLoreLoadPlaces();ctx.CHINA_BIRTHPLACES=[{id:'31'}];scripts[2].onload();assert.equal(await retry,ctx.CHINA_BIRTHPLACES);
});

test('entry preloads during parsing but does not execute against a missing DOM',()=>{
 const nodes=[],listeners=new Map();
 const ctx={URL,location:{protocol:'https:'},document:{readyState:'loading',currentScript:{dataset:{entry:'module-mobile'},src:'https://example.test/lore/entry-loader.js'},createElement:()=>({}),head:{append:n=>nodes.push(n)},addEventListener:(name,fn)=>listeners.set(name,fn),querySelector:()=>null}};
 vm.runInNewContext(read('entry-loader.js'),ctx);assert.equal(nodes.length,1);assert.equal(nodes[0].rel,'modulepreload');
 listeners.get('DOMContentLoaded')();assert.equal(nodes.length,2);assert.equal(nodes[1].src,nodes[0].href);assert.equal(nodes[1].type,'module');
});
