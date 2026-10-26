import {calculateHora} from '../hora.js';
import {horaNarrative} from '../horaNarrative.js';
import {calculateDasamsa} from '../dasamsa.js';
import {dasamsaNarrative} from '../dasamsaNarrative.js';
import {navamsaNarrative} from '../navamsaNarrative.js';
import {calculateNavamsa} from '../navamsa.js';
import {vedicTransitHTML,calculateVedicTransit} from '../transitNarrative.js';
import {themes,vedicThemeNarrative} from '../themeNarrative.js';
import {calculateVedicChart} from '../calculateVedicChart.js';
import {renderNorthIndianChart} from '../renderers/northIndianChart.js';
import {GRAHA_METADATA,GRAHA_ORDER} from '../metadata/grahas.js';
import {D1_READING_STEPS,D1_READING_FORMULA} from '../metadata/readingGuide.js';
import {buildReadingStructure} from '../readingStructure.js';
import {interpretChart} from '../interpretation/engine.js';
import {createDetailReader} from './detailReader.js';
import {formatDms} from '../zodiac.js';

const $=id=>document.getElementById(id),isoDate=value=>new Date(value).toISOString().slice(0,10);
let selectedVarga='D1';
let chart=null,reading=null,interpretation=null,firstRender=true,summarySelection={type:'house',id:1};
const reader=createDetailReader({getReading:()=>reading,getInterpretation:()=>interpretation,getContextVersion:()=>`${chart.ayanamsaMode}:${chart.input.nodeType}:${chart.ayanamsa}`});

document.querySelector('.legend').innerHTML=GRAHA_ORDER.map(name=>`<span><b>${GRAHA_METADATA[name].abbreviation}</b> ${GRAHA_METADATA[name].chineseName}</span>`).join('');
$('readingGuide').innerHTML=`<div class="guide-grid">${D1_READING_STEPS.map((step,index)=>`<div><h3>${['一','二','三','四'][index]}、${step.title}</h3><p>${step.description}</p></div>`).join('')}</div><div class="formula">${D1_READING_FORMULA.map(item=>`<b>${item.term}</b>：${item.meaning}`).join(' × ')}</div>`;

function convention(){return `Sidereal · ${chart.ayanamsaLabel.replace(' / Chitrapaksha','')} · Whole Sign · ${chart.input.nodeType==='true'?'True':'Mean'} Node`;}
function renderSummary(type,id){summarySelection={type,id:type==='house'?Number(id):id};renderOverview();}
function openDetail(type,id){renderSummary(type,id);const house=type==='house'?Number(id):reading.planets.find(p=>p.name===id)?.house;const target=document.querySelector(`[data-theme-house="${house}"]`);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({behavior:'smooth',block:'center'});}
function renderHouses(){
  $('houseList').innerHTML=reading.houses.map(item=>{const report=interpretation.houses[item.house];return `<button type="button" class="house-card interpreted" data-house-card="${item.house}"><span>${String(item.house).padStart(2,'0')}H</span><div><h3>${item.houseMeta.title}</h3><p class="house-summary">${report.summary}</p><small>${item.rashi} · ${item.lord} → ${item.lordHouse}H${item.occupants.length?`<br>${item.occupants.map(name=>GRAHA_METADATA[name].abbreviation).join(' · ')}`:''}</small><em>阅读 →</em></div></button>`;}).join('');
  document.querySelectorAll('[data-house-card]').forEach(node=>node.onclick=()=>openDetail('house',Number(node.dataset.houseCard)));
}
function renderGrahas(){$('grahaList').innerHTML=GRAHA_ORDER.map(name=>{const item=reading.planets.find(planet=>planet.name===name),meta=GRAHA_METADATA[name],report=interpretation.grahas[name];return `<button type="button" class="graha-card interpreted" data-graha-card="${name}"><b>${meta.abbreviation}</b><span><strong>${name} · ${meta.chineseName}</strong><em class="graha-summary">${report.summary}</em><small>${item.rashi} ${formatDms(item.longitude)} · ${item.house}H<br>${item.nakshatra} · Pada ${item.pada}</small><i>阅读${meta.chineseName} →</i></span></button>`;}).join('');document.querySelectorAll('[data-graha-card]').forEach(node=>node.onclick=()=>openDetail('planet',node.dataset.grahaCard));}
function renderDasha(){
 const now=new Date(),birth=new Date(chart.utc),safe=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
 const periods=chart.dasha.timeline.map(period=>{
 const isBirth=birth>=period.start&&birth<period.end,isCurrent=now>=period.start&&now<period.end;
 const p=reading.planets.find(p=>p.name===period.lord),name=p.meta.chineseName,area=themes[p.house-1],house=reading.houses[p.house-1],dispositor=reading.planets.find(x=>x.name===house.lord);
 const ruled=p.ruledHouses.map(h=>`**第${h}宫 · ${themes[h-1][0]}**`).join('、');
 const opposite=reading.planets.find(x=>x.name===(p.name==='Rahu'?'Ketu':'Rahu'));
 const companions=p.conjunctWith.map(n=>reading.planets.find(x=>x.name===n)).filter(Boolean);
 const paragraphs=[
 `这段${name}大运，可以先从**${area[0]}**读起。${name}代表${p.meta.basicMeaning}，而你的本命${name}落在**${p.rashiMeta.chineseName}第${p.house}宫**，因此这一阶段的观察重点，会落到${area[2]}。这不是说每年都会发生同一件事，而是这些需要更值得持续梳理。`,
 ruled?`${name}还掌管${ruled}。这些宫位的主题，会通过它所在的第${p.house}宫寻找落实方式：${p.ruledHouses.map(h=>themes[h-1][0]).join('、')}，需要和${area[0]}一起考虑。大运的解读依据，正是**主星的含义、落宫与宫主星联系**，而不是只按星名判断吉凶。`:`${name}属于月交点，这里不为它指定独立的宫主权。它所在的${p.rashiMeta.chineseName}由${dispositor.meta.chineseName}掌管，而${dispositor.meta.chineseName}落在**第${dispositor.house}宫 · ${themes[dispositor.house-1][0]}**。因此理解这段时期时，还要把${area[0]}与${themes[dispositor.house-1][0]}连起来看。`,
 companions.length?`本命${name}与${companions.map(x=>`**${x.meta.chineseName}**`).join('、')}同宫，使这段时期不只有${name}一种表达。${companions.map(x=>`${x.meta.chineseName}带来${x.meta.basicMeaning}`).join('；')}。这些需要可能相互支持，也可能要求你重新安排优先次序。`:!p.ruledHouses.length?`本命**${name}与${opposite.meta.chineseName}**位于第${p.house}宫与第${opposite.house}宫，连接${area[0]}和${themes[opposite.house-1][0]}。罗睺强调探索与追求，计都强调简化与抽离；这段时期可以留意，投入一端时是否忽略了另一端的需要。`:`${name}所在星座的宫主星是**${dispositor.meta.chineseName}**，落在第${dispositor.house}宫。它把${area[0]}进一步连接到${themes[dispositor.house-1][0]}，可以从这两个主题之间的实际选择，理解这一阶段怎样落到生活里。`,
 `比较值得着手的是：**${area[3]}**。大运描述的是较长的阶段背景；具体哪一年、哪一月更突出，还需要结合小运与行运，不能把整段时间理解成连续的好运或坏运。`
 ];
 return {name,area,period,isBirth,isCurrent,body:paragraphs.map(t=>'<p>'+safe(t)+'</p>').join('')};
 });
 const host=$('dashaTimeline');host.className='dasha-layout dasha-inline';
 host.innerHTML=periods.map((p,i)=>`<details class="dasha-item" data-period="${i}" ${p.isCurrent?'open':''}><summary><span class="dasha-item-heading"><span class="dasha-title">${p.name}大运</span><span class="dasha-flags">${p.isBirth?'<span>出生时</span>':''}${p.isCurrent?'<span>当前</span>':''}</span><span class="dasha-duration">${p.period.durationYears} 年<span class="dasha-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 10 5 5 5-5"/></svg></span></span><span class="dasha-dates">${isoDate(p.period.start)} — ${isoDate(p.period.end)}</span></span></summary><article class="dasha-narrative"><h3>${p.name}大运 · ${p.area[1]}</h3><div class="theme-evidence">${isoDate(p.period.start)} — ${isoDate(p.period.end)} · ${p.period.durationYears} 年 · ${p.area[0]}</div>${p.body}</article></details>`).join('');
}

function renderOverview(){
 const panel=$('selectionPanel');panel.classList.remove('vedic-theme-overview');panel.classList.add('vedic-varga-switch');
 panel.innerHTML='<h3>切换星盘</h3><div class="vedic-varga-buttons"><button type="button" data-varga="D1">D1 · 本命盘</button><button type="button" data-varga="D2">D2 · 财富分盘</button><button type="button" data-varga="D9">D9 · 九分盘</button><button type="button" data-varga="D10">D10 · 十分盘</button></div><p class="varga-description"></p>';
 panel.querySelectorAll('[data-varga]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.varga===selectedVarga));button.onclick=()=>{selectedVarga=button.dataset.varga;renderSelectedChart();renderOverview();renderThemes();};});
 panel.querySelector('.varga-description').textContent=selectedVarga==='D2'?'D2 · Hora。太阳—月亮时分法；查看资源积累与运用，下方显示D2解读。':selectedVarga==='D10'?'D10 · Dasamsa。查看事业与专业发展，下方显示D10解读，并与D1对照。':selectedVarga==='D9'?'D9 · Navamsa。由同一出生时刻的九曜及上升位置计算。下方显示D9九分盘解读，并与D1对照。':'D1 · Rashi。查看出生时刻的本命宫位；点击宫位或九曜可跳转下方生活主题。';
}
function renderSelectedChart(){
 const selected=selectedVarga==='D2'?calculateHora(chart):selectedVarga==='D10'?calculateDasamsa(chart):selectedVarga==='D9'?calculateNavamsa(chart):chart;
 renderNorthIndianChart($('d1Chart'),selected,selectedVarga==='D1'?{onSelectHouse:number=>openDetail('house',number),onSelectGraha:name=>openDetail('planet',name)}:{});
 $('d1Chart').closest('section').querySelector('h2').textContent=selectedVarga==='D2'?'D2 · 财富分盘（太阳—月亮时分法）':selectedVarga==='D10'?'D10 · 十分盘':selectedVarga==='D9'?'D9 · 九分盘':'D1 · 本命盘';
 $('lagnaSummary').textContent=`${selected.lagna.sign} ${formatDms(selected.lagna.siderealLongitude)}`;
 $('lagnaSummary').parentElement.lastChild.textContent=selectedVarga==='D2'?'。九曜集中在狮子座和巨蟹座，是本页时分法的正常结果。':selectedVarga==='D10'?'。下方显示D10事业与专业发展的解读。':selectedVarga==='D9'?'。当前显示D9九分盘，下方显示D9九分盘解读。':'。点击宫位或九曜，跳转到对应的生活主题解读。';
}
function renderThemes(){
 const report=selectedVarga==='D2'?horaNarrative(chart):selectedVarga==='D10'?dasamsaNarrative(chart):selectedVarga==='D9'?navamsaNarrative(chart):vedicThemeNarrative(chart);let host=$('vedicThemeReading');
 if(!host){host=document.createElement('section');host.id='vedicThemeReading';host.className='section vedic-theme-reading';$('result').children[0].after(host);
 for(const id of ['readingGuide','houseList','grahaList','moonName'])$(id).closest('section').hidden=true;
 const periods=$('dashaTimeline').closest('section');host.after(periods);periods.querySelector('h2').textContent='人生阶段 · 大运';periods.querySelector('p').textContent='大运是印占的人生阶段周期，不是“大好运”。每个阶段由一颗星作为主星，结合本命盘观察这一时期的生活主题。';}

 const text=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
 host.innerHTML='<h2>'+ (selectedVarga==='D2'?'D2 · 财富与资源运用':selectedVarga==='D10'?'D10 · 事业与专业发展':selectedVarga==='D9'?'D9 · 长期关系与成熟后的选择':'本命盘 · 生活主题与重点')+'</h2>'+ (selectedVarga==='D1'?'<article class="vedic-theme-overview"><h3>整张盘的主线</h3>'+report.overview.map(p=>'<p>'+text(p)+'</p>').join('')+'</article>':'')+'<div class="vedic-theme-grid">'+[...report.cards].sort((a,b)=>b.importance-a.importance).slice(0,4).map((c,i)=>'<details class="vedic-theme-card vm-reading-fold" data-theme-house="'+c.house+'" '+(i===0?'open':'')+'><summary><span class="vm-reading-heading"><span class="vm-reading-title">'+text(c.title)+'</span><span class="theme-stars">重要性 '+ '★'.repeat(c.stars)+'☆'.repeat(5-c.stars)+'</span></span><svg class="vm-reading-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></summary><div class="vm-reading-body"><div class="theme-evidence">'+text(c.evidence)+'</div>'+c.paragraphs.map(p=>'<p>'+text(p)+'</p>').join('')+'</div></details>').join('')+'</div>';
}
function render(){
  $('currentConvention').textContent=convention();$('birthSummary').textContent=`${chart.input.date} · ${chart.input.time} · ${chart.input.place||'手动坐标'}`;$('lagnaSummary').textContent=`${chart.lagna.sign} ${formatDms(chart.lagna.siderealLongitude)}`;
  reading=buildReadingStructure(chart);interpretation=interpretChart(chart);reader.refresh();
  renderSelectedChart();renderHouses();renderGrahas();renderSummary(summarySelection.type,summarySelection.id);
  const moon=reading.planets.find(item=>item.name==='Moon');$('moonName').textContent=moon.nakshatra;$('moonPada').textContent=`Pada ${moon.pada}`;$('moonPosition').textContent=`Moon · ${moon.rashi} ${formatDms(moon.longitude)} · ${moon.house}H`;renderDasha();renderThemes();$('result').hidden=false;
  const oldInterpretation=$('house1Interpretation');if(oldInterpretation)oldInterpretation.remove();
  if(firstRender){$('result').scrollIntoView({behavior:'smooth',block:'start'});firstRender=false;}
}
function calculate(event){event?.preventDefault();$('formError').textContent='';try{chart=calculateVedicChart({date:$('birthDate').value,time:$('birthTime').value,place:$('birthPlace').value,latitude:Number($('latitude').value),longitude:Number($('longitude').value),timezoneOffset:$('timezone').value},{ayanamsaMode:$('ayanamsaMode').value,nodeType:$('nodeType').value});render();}catch(error){$('formError').textContent=String(error.message||error);}}
$('birthForm').addEventListener('submit',calculate);$('ayanamsaMode').addEventListener('change',()=>{$('settingNotice').hidden=false;calculate();});$('nodeType').addEventListener('change',calculate);$('guideToggle').addEventListener('click',()=>{$('readingGuide').hidden=!$('readingGuide').hidden;});calculate();
window.magiccatAstrology={
 transitInterpretation(natal,target){return vedicTransitHTML(natal,target);},
 transitPositions(natal,target){return calculateVedicTransit(natal,target).transit.grahas.map(p=>({name:GRAHA_METADATA[p.name].chineseName,longitude:p.siderealLongitude,retrograde:p.retrograde,house:p.bhava}));},
 draw(input,host){renderNorthIndianChart(host,calculateVedicChart(input,{ayanamsaMode:input.ayanamsaMode,nodeType:input.nodeType}));},
 getInput(){return {date:$('birthDate').value,time:$('birthTime').value,place:$('birthPlace').value,latitude:Number($('latitude').value),longitude:Number($('longitude').value),timezoneOffset:$('timezone').value,ayanamsaMode:$('ayanamsaMode').value,nodeType:$('nodeType').value};},
 restore(input){for(const [key,id] of Object.entries({date:'birthDate',time:'birthTime',place:'birthPlace',latitude:'latitude',longitude:'longitude',timezoneOffset:'timezone',ayanamsaMode:'ayanamsaMode',nodeType:'nodeType'}))if(input[key]!==undefined)$(id).value=input[key];$('birthPlace').setCustomValidity('');calculate();},
 positions(input){return calculateVedicChart(input,{ayanamsaMode:input.ayanamsaMode,nodeType:input.nodeType}).grahas.map(p=>({name:GRAHA_METADATA[p.name].chineseName,longitude:p.siderealLongitude,retrograde:p.retrograde}));}
};

