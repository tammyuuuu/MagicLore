import {placePlanetSymbols} from './planetSymbolLayout.js';
import {planetSymbol} from './planetSymbols.js';
import {natalReading,natalFocus,transitReading,transitFocus,readingHTML,readingNote} from './interpretation.js';
import {calculateWesternChart,calculateWesternTransit} from './calculateWesternChart.js';
import {scanFinanceWindows} from './financeWindows.js';
import {transitThemes} from './transitThemes.js';
import {calculateRelocation,relocationNarrative} from './relocation.js';
import {natalNarrative} from './natalNarrative.js';
import {classicalNarrative} from './classicalNarrative.js';

import {splitLongitude,normalizeLongitude as norm} from '../vedic/zodiac.js';
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',NorthNode:'北交点',SouthNode:'南交点'};
const glyphs={Sun:'☉',Moon:'☽',Mercury:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆',Pluto:'♇'};
const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const zodiac=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const $=id=>document.getElementById(id);
function position(value) {const p=splitLongitude(value);return `${signs[p.signIndex]} ${p.degree}°${String(p.arcminute).padStart(2,'0')}′${String(p.arcsecond).padStart(2,'0')}″`;}
let chart,astrologyMode="modern";
function wheel(c) {
  const size=620,center=310,aspectRadius=165;
  const point=(longitude,r)=>{const a=(180+(longitude-c.asc))*Math.PI/180;return [center+r*Math.cos(a),center-r*Math.sin(a)];};
  const line=(a,b,style)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${style}/>`;
  const text=(p,t,extra='')=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle" ${extra}>${t}</text>`;
  let svg=`<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="西洋占星本命盘"><g fill="none" stroke="var(--gold)"><circle cx="310" cy="310" r="287"/><circle cx="310" cy="310" r="250"/><circle cx="310" cy="310" r="230" stroke-width=".8" opacity=".65"/><circle cx="310" cy="310" r="165"/></g>`;
  for(let d=0;d<360;d+=5)svg+=line(point(d,d%30===0?250:280),point(d,287),'stroke="var(--gold)" stroke-width="1" opacity=".5"');
  const zodiacColors=['#b94e59','#427b53','#ad841d','#426fae'];
  zodiac.forEach((s,i)=>{const position=point(i*30+15,268);position[1]+=3;svg+=text(position,s+'\uFE0E',`class="western-zodiac-symbol" font-size="23" font-weight="400" font-family="Arial, Apple Symbols, Segoe UI Symbol, sans-serif" fill="${zodiacColors[i%4]}"`);});
  c.cusps.forEach((d,i)=>{svg+=line(point(d,aspectRadius),point(d,250),`stroke="var(--gold)" stroke-width="${i%3===0?2:1}" opacity=".5"`);});
  const byName=Object.fromEntries(c.planets.map(p=>[p.name,p]));
  const aspectColors={0:'#b69b6a',60:'#829b87',90:'#bf8588',120:'#829fc0',150:'#9b92aa',180:'#b8738b'};
  c.aspects.forEach(a=>{const major=[0,60,90,120,180].includes(a.angle);svg+=line(point(byName[a.a].longitude,aspectRadius),point(byName[a.b].longitude,aspectRadius),`class="western-aspect" data-angle="${a.angle}" stroke="${aspectColors[a.angle]||'#9b92aa'}" stroke-width="${major?1.7:1.2}" opacity="${major?.66:.32}"`);});
  // House numbers sit in their own annulus, centered on the actual cusp interval.
  c.cusps.forEach((d,i)=>{svg+=text(point(norm(d+norm(c.cusps[(i+1)%12]-d)/2),240),i+1,'class="western-house-number" font-size="13" fill="var(--muted)" stroke="var(--paper,#f7f8fd)" stroke-width="4" stroke-linejoin="round" paint-order="stroke"');});
  const placements=placePlanetSymbols(c.planets.filter(p=>glyphs[p.name]),point);
  for(const {planet:p,position:label} of placements){const anchor=point(p.longitude,aspectRadius),dx=label[0]-anchor[0],dy=label[1]-anchor[1],length=Math.hypot(dx,dy),end=length>16?[label[0]-dx/length*16,label[1]-dy/length*16]:label;svg+=line(anchor,end,'stroke="var(--muted)" stroke-width=".8" opacity=".45"');svg+=planetSymbol(p.name,label);}
  svg+=text(point(c.asc,298),'ASC','font-size="11" fill="var(--gold2)"');svg+=text(point(c.mc,298),'MC','font-size="11" fill="var(--gold2)"');
  return svg+'</svg>';
}
function readInput(){return {transitOrb:Number(document.getElementById('mwTransitOrb')?.value??3),aspectOrbs:Object.fromEntries([...document.querySelectorAll('[data-western-orb]')].map(s=>[s.dataset.westernOrb,Number(s.value)])),astrologyMode,place:$('wPlace').value,date:$('wDate').value,time:$('wTime').value,offset:$('wOffset').value.trim(),latitude:$('wLatitude').value,longitude:$('wLongitude').value,system:$('wSystem').value,nodeType:$('wNode').value,residence:window.magiccatResidence?.get()||null};}
function render() {
  astrologyMode=chart.input.astrologyMode==='classical'?'classical':'modern';
  $('wModern').setAttribute('aria-pressed',String(astrologyMode==='modern'));
  $('wClassical').setAttribute('aria-pressed',String(astrologyMode==='classical'));
  $('wModeNote').textContent=astrologyMode==='classical'?'古典模式：默认阿卡比宫制，以日月与五颗行星、七星宫主星及主要相位展开解读；保留南北交点。结合昼夜盘、尊贵与失势、角续果宫、逆行、太阳距离及庙与擢升接纳判断。':'现代模式：默认普拉西德宫制，包含天王星、海王星、冥王星与相关相位。切换后可自行调整宫制。';
  $('wSummary').textContent=`${chart.input.date} ${chart.input.time} · UTC${chart.input.offset} · 纬度 ${chart.input.latitude} / 经度 ${chart.input.longitude} · Tropical / ${chart.input.system} / ${chart.input.nodeType==='true'?'True Node（近似）':'Mean Node'} · UTC ${chart.utc}`;
  $('wWheel').innerHTML=wheel(chart);
  $('wAngles').innerHTML=`<p>ASC 上升：${position(chart.asc)}</p><p>MC 天顶：${position(chart.mc)}</p><p>DSC 下降：${position(norm(chart.asc+180))}</p><p>IC 天底：${position(norm(chart.mc+180))}</p>`;
  $('wPlanets').innerHTML=chart.planets.map(p=>`<tr><td>${names[p.name]}</td><td>${position(p.longitude)}</td><td>${p.longitude.toFixed(6)}°</td><td>${p.house} 宫</td><td>${p.retrograde?'逆行 ℞':'顺行'}</td></tr>`).join('');
  $('wHouses').innerHTML=chart.cusps.map((d,i)=>`<div><b>第 ${i+1} 宫</b>${position(d)}<br>${d.toFixed(6)}°</div>`).join('');
  const aspectNote=$('wAspects').closest('section').querySelector('.note');if(aspectNote)aspectNote.textContent='容许度：'+[[0,'合相'],[60,'六合'],[90,'刑相'],[120,'拱相'],[180,'对冲']].map(([a,n])=>n+' '+(chart.input.aspectOrbs?.[a]??({0:8,60:4,90:6,120:6,180:8})[a])+'°').join('，')+'。交点不参与此相位表。';
  $('wAspects').innerHTML=chart.aspects.sort((a,b)=>a.orb-b.orb).map(a=>`<tr><td>${names[a.a]}</td><td>${a.label} ${a.angle}°</td><td>${names[a.b]}</td><td>${a.orb.toFixed(3)}°</td></tr>`).join('');
  let interpretation=$('wInterpretation');if(!interpretation){interpretation=document.createElement('div');interpretation.id='wInterpretation';$('wResult').append(interpretation);}interpretation.innerHTML=readingHTML(astrologyMode==='classical'?'古典本命盘 · 资源与落实条件':'本命盘 · 从全局到重点',astrologyMode==='classical'?classicalNarrative(chart):natalNarrative(chart))+readingNote;
  $('wResult').hidden=false;
}
$('westernForm').onsubmit=e=>{e.preventDefault();try{chart=calculateWesternChart(readInput());render();$('wError').textContent='';localStorage.setItem('magiccat_western_input',JSON.stringify(chart.input));}catch(error){$('wError').textContent=error.message;}};
// Manual coordinate edits retain the location name entered by the user.
// Each visit starts from the public demonstration defaults in the form.
$('wExport').onclick=()=>{if(!chart)return;const url=URL.createObjectURL(new Blob([JSON.stringify(chart,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`western-chart-${chart.input.date}.json`;a.click();URL.revokeObjectURL(url);};



window.magiccatAstrology={
 scanFinanceWindows,
 openNatal(input){this.restore(input);chart=calculateWesternChart(input);render();},
 relocation(natal,destination){return calculateRelocation(natal,destination);},
 relocationReading(result){return readingHTML('重置盘 · 城市发展的生活主题',relocationNarrative(result));},
 relocationThemes(result){return relocationNarrative(result);},

 getInput:readInput,
 transitInterpretation(natal,target){const birth=calculateWesternChart(natal),current=calculateWesternChart(target);const themes=transitThemes(birth,current,{mode:'unified'});return readingHTML('行运 · 当前最重要的相位',themes.length?themes:[{title:'当前没有符合范围的主要相位',text:'可以比较其他日期。'}])+readingNote+'<p class="note">最多展示4个相位，按重要性星级、再按综合权重排序。星级考虑行运行星节奏、被触及的本命星体、领域关系与相位偏差，不表示吉凶。持续时间是同一相位在当前行运容许度内的本次连续区间，按行运时区显示，边界为近似值；逆行后再次进入另计。长期按日扫描、短期按小时扫描，最多前后各2年或180天。</p>';},
 draw(input,host){host.innerHTML=wheel(calculateWesternChart(input));},
 drawTransit(natal,target,host){host.innerHTML=wheel(calculateWesternTransit(natal,target)).replace('aria-label="西洋占星本命盘"','aria-label="行运行星落入本命宫位"');},
 transitPositions(natal,target){return calculateWesternTransit(natal,target).planets.map(p=>({name:names[p.name],longitude:p.longitude,retrograde:p.retrograde,house:p.house}));},
 restore(input){if(document.getElementById('mwTransitOrb'))document.getElementById('mwTransitOrb').value=String(input.transitOrb??3);for(const control of document.querySelectorAll('[data-western-orb]'))control.value=String(input.aspectOrbs?.[control.dataset.westernOrb]??control.dataset.defaultOrb);astrologyMode=input.astrologyMode==='classical'?'classical':'modern';for(const [key,id] of Object.entries({date:'wDate',time:'wTime',place:'wPlace',offset:'wOffset',latitude:'wLatitude',longitude:'wLongitude',system:'wSystem',nodeType:'wNode'}))if(input[key]!==undefined)$(id).value=input[key];$('wPlace').setCustomValidity('');window.magiccatResidence?.set(input.residence||null);},
 positions(input){return calculateWesternChart(input).planets.map(p=>({name:names[p.name],longitude:p.longitude,retrograde:p.retrograde}));}
};




function switchMode(mode){
  const previous=astrologyMode,previousSystem=$('wSystem').value;
  try{astrologyMode=mode;$('wSystem').value=mode==='classical'?'alcabitius':'placidus';
    chart=calculateWesternChart(readInput());render();$('wError').textContent='';
    localStorage.setItem('magiccat_western_input',JSON.stringify(chart.input));
  }catch(error){astrologyMode=previous;$('wSystem').value=previousSystem;$('wError').textContent=error.message;}
}
$('wModern').onclick=()=>switchMode('modern');
$('wClassical').onclick=()=>switchMode('classical');
$('wSystem').addEventListener('change',()=>{if(chart)$('westernForm').requestSubmit();});
