import {installChartContext} from './chart-context.js';
import {loadBirthOffset} from './birth-offset-loader.js';
import {installDetails} from './module-details.js';
import {STORES,archiveRef,read,checkpoint,migrate} from './profile-store.js';
import {registerPWA} from './pwa.js';
document.body.classList.add('ml-app','ml-module','ml-shell');
const isBazi=location.pathname.endsWith('bazi_web.html'),title=isBazi?'八字排盘':location.pathname.endsWith('western_web.html')?'西洋占星':location.pathname.endsWith('vedic_web.html')?'印度占星':'生命灵数';
document.title=`${title} · 星藏 MagicLore`;
const header=document.createElement('div');header.className='ml-module-header';header.innerHTML=`<a href="index.html#home">‹ <b>星藏</b></a><small>${title}</small><a href="index.html#profiles" aria-label="打开统一档案">档案 ▤</a>`;document.body.prepend(header);
const nav=document.createElement('nav');nav.className='ml-nav';nav.setAttribute('aria-label','主导航');nav.innerHTML='<a href="index.html#home" aria-current="page"><span>⌂</span>藏馆</a><a href="index.html#profiles"><span>▤</span>档案</a><a href="index.html#notes"><span>✎</span>笔记</a><a href="index.html#settings"><span>☷</span>我的</a>';document.body.append(nav);
// Retain legacy archive formats, but checkpoint every legacy write before it happens.
const nativeSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(this===localStorage&&Object.values(STORES).includes(key)){const old=this.getItem(key);if(old&&!Array.isArray(JSON.parse(old)))throw Error('原始档案格式异常，请先导出备份。');checkpoint();const parsed=JSON.parse(value);if(!Array.isArray(parsed))throw Error('档案必须为列表。');}return nativeSet.call(this,key,value);};
try{migrate();}catch(e){console.warn(e);}
async function prepare(){installDetails();
// Dynamic legacy styles must precede the mobile reading layer.
document.head.append(document.querySelector('link[href="module-mobile.css"]'));
if(isBazi){const head=document.querySelector('.work-head small');if(head)head.textContent='MAGICLORE · 四柱与时间';
for(const id of ['compare','debug']){const el=document.getElementById(id);if(!el)continue;const heading=el.previousElementSibling;if(heading?.tagName==='H2'){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=heading.textContent;heading.before(details);details.append(summary,el);heading.remove();}}
const time=document.getElementById('timeSummary');if(time){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='出生时刻与时间换算';time.before(details);details.append(summary,time);const prev=details.previousElementSibling;if(prev?.tagName==='H2')prev.remove();}
const chart=document.querySelector('.chart-wrap');if(chart){chart.tabIndex=0;chart.setAttribute('aria-label','四柱与运年命盘，可横向滚动查看扩展柱');}
const luck=document.getElementById('luck');new MutationObserver(()=>{luck.querySelectorAll('.luck-row>div:not([role])').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','查看'+card.textContent.trim()+'大运流年');card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};});}).observe(luck,{childList:true,subtree:true});}
if(!isBazi&&window.magiccatAstrology){const form=document.getElementById('westernForm')||document.getElementById('birthForm');const edit=document.createElement('button');edit.type='button';edit.className='ml-secondary ml-edit-result';edit.textContent='修改出生信息';edit.hidden=location.hash!=='#report';edit.onclick=()=>location.hash='natal';header.after(edit);window.addEventListener('hashchange',()=>edit.hidden=location.hash!=='#report');form.addEventListener('submit',()=>{if(form.checkValidity()&&!(document.getElementById('formError')?.textContent||document.getElementById('wError')?.textContent))location.hash='report';});} const query=new URLSearchParams(location.search),store=query.get('mlStore'),index=query.get('mlArchive');if(store&&index!==null){try{if(!(store in STORES))throw Error('未知档案体系');const rows=read(store),ref=query.get('mlRef'),record=ref?rows.find(row=>archiveRef(row)===ref):rows[Number(index)];if(!record)throw Error('档案已移动或不存在');if(isBazi){window.magicLoreBazi?.restore(record.input);}else if(window.magiccatAstrology){let input=record.input;if(store==='birth'){const {birthOffset}=await loadBirthOffset();const offset=birthOffset(input);input={...window.magiccatAstrology.getInput(),...input,offset,timezoneOffset:offset};}window.magiccatAstrology.openNatal?.(input);if(!window.magiccatAstrology.openNatal)window.magiccatAstrology.restore(input);location.hash='report';window.dispatchEvent(new Event('magiccat-place-restored'));}else if(store==='relationship'){window.RelationshipUI.restore(record);}else{document.querySelector('[data-view="life"]')?.click();document.getElementById('birthDate').value=record.iso||record.input?.date;document.getElementById('birthForm').requestSubmit();}}catch(e){const p=document.createElement('p');p.className='ml-warning';p.textContent='无法带入档案：'+e.message;header.after(p);}}
await installChartContext({header,nav});
if(location.pathname.endsWith('destiny_book_web.html')){const {installNumerologyMobile}=await import('./numerology-mobile.js');installNumerologyMobile();}
if(location.pathname.endsWith('vedic_web.html')){const {installVedicMobile}=await import('./vedic-mobile.js');installVedicMobile();}
if(isBazi){const {installBaziMobile}=await import('./bazi-mobile.js');installBaziMobile();}
if(location.pathname.endsWith('western_web.html')){const {installWesternMobile}=await import('./western-mobile.js');installWesternMobile();}
}
const originalPrepare=prepare;prepare=async()=>{try{await originalPrepare();}finally{document.body.dataset.mlReady='true';document.querySelector('.ml-startup')?.remove();}};
if(document.readyState==='complete')prepare();else window.addEventListener('load',prepare,{once:true});
window.addEventListener('error',event=>{if(/quota|storage|档案|JSON/i.test(event.message||'')){const p=document.createElement('p');p.className='ml-warning';p.setAttribute('role','alert');p.textContent='保存未完成，请先导出备份并检查设备存储空间。';header.after(p);}});
registerPWA();
