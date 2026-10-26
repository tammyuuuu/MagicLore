import {classicalConditions} from './classicalNarrative.js';
import {planetDetails} from './planetDetails.js';
import {planetSymbol} from './planetSymbols.js';
const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
const seven=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const exalt={Sun:0,Moon:1,Mercury:5,Venus:11,Mars:9,Jupiter:3,Saturn:6};
const signs=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const norm=x=>((x%360)+360)%360;
// Egyptian bounds, with upper endpoints excluded. Chaldean faces follow the seven-planet cycle.
// Reference: flatlib/dignities/tables.py (Egyptian terms and Chaldean faces).
const terms=[
 [['Jupiter',6],['Venus',12],['Mercury',20],['Mars',25],['Saturn',30]],
 [['Venus',8],['Mercury',14],['Jupiter',22],['Saturn',27],['Mars',30]],
 [['Mercury',6],['Jupiter',12],['Venus',17],['Mars',24],['Saturn',30]],
 [['Mars',7],['Venus',13],['Mercury',19],['Jupiter',26],['Saturn',30]],
 [['Jupiter',6],['Venus',11],['Saturn',18],['Mercury',24],['Mars',30]],
 [['Mercury',7],['Venus',17],['Jupiter',21],['Mars',28],['Saturn',30]],
 [['Saturn',6],['Mercury',14],['Jupiter',21],['Venus',28],['Mars',30]],
 [['Mars',7],['Venus',11],['Mercury',19],['Jupiter',24],['Saturn',30]],
 [['Jupiter',12],['Venus',17],['Mercury',21],['Saturn',26],['Mars',30]],
 [['Mercury',7],['Jupiter',14],['Venus',22],['Saturn',26],['Mars',30]],
 [['Mercury',7],['Venus',13],['Jupiter',20],['Mars',25],['Saturn',30]],
 [['Venus',12],['Jupiter',16],['Mercury',19],['Mars',28],['Saturn',30]]
];
export const termRuler=longitude=>terms[Math.floor(norm(longitude)/30)].find(([,end])=>norm(longitude)%30<end)[0];
export const faceRuler=longitude=>['Mars','Sun','Venus','Mercury','Moon','Saturn','Jupiter'][Math.floor(norm(longitude)/10)%7];
export const mirroredPoints=longitude=>({antiscion:norm(180-longitude),contraAntiscion:norm(-longitude)});
export function shortPosition(longitude){const total=Math.round(norm(longitude)*60)%21600;return signs[Math.floor(total/1800)]+'\uFE0E '+Math.floor(total%1800/60)+'°'+String(total%60).padStart(2,'0')+'′';}
const positionHTML=longitude=>{const [sign,degree]=shortPosition(longitude).split(' ');return `<span class="wv-sign">${sign}</span><span class="wv-degree">${degree}</span>`;};
const icon=name=>`<svg class="wv-planet-icon" viewBox="0 0 30 30" role="img" aria-label="${names[name]}">${planetSymbol(name,[15,15])}</svg>`;
export function aspectMatrix(chart,{natal=null}={}){
 const rows=chart.planets.filter(p=>names[p.name]),columns=(natal||chart).planets.filter(p=>names[p.name]);
 const cells=rows.map((p,i)=>{const details=planetDetails(chart,p.name,{natal});return columns.map((q,j)=>!natal&&j>=i?null:details.aspects.find(a=>a.other===q.name)||null);});
 return {rows,columns,cells,transit:!!natal};
}
export function classicalTableData(chart){
 const conditions=classicalConditions(chart),{states,by}=conditions;
 const rows=seven.map(name=>{const s=states[name],p=by[name],dignities=s.dignities.map(v=>v==='入庙'?'庙':v==='擢升'?'旺':'三分');if(termRuler(p.longitude)===name)dignities.push('界');if(faceRuler(p.longitude)===name)dignities.push('面');if(s.detriment)dignities.push('失势');if(s.fall)dignities.push('落陷');const delta=norm(by.Sun.longitude-p.longitude);const orientation=name==='Sun'?null:delta<1e-8?'合日':Math.abs(delta-180)<1e-8?'对日':delta<180?'东出':'西入';
 return {name,longitude:p.longitude,house:p.house,ruled:planetDetails(chart,name).ruledHouses,dignities:[...new Set(dignities)],status:[s.sect===true?'得时':s.sect===false?'失时':null,orientation,p.retrograde?'逆行':'顺行',s.solar==='灼伤'?'燃烧':s.solar].filter(Boolean),...mirroredPoints(p.longitude)};});
 const received=(guest,host)=>{const sign=Math.floor(norm(guest.longitude)/30);return rulers[sign]===host.name?'庙':exalt[host.name]===sign?'旺':null;};
 const mutual=[],receptions=[];
 for(let i=0;i<seven.length;i++)for(let j=i+1;j<seven.length;j++){const a=by[seven[i]],b=by[seven[j]],ab=received(a,b),ba=received(b,a);if(ab&&ba)mutual.push({a:a.name,b:b.name,ab,ba});else if(ab)receptions.push({host:b.name,guest:a.name,by:ab});else if(ba)receptions.push({host:a.name,guest:b.name,by:ba});}
 return {rows,mutual,receptions,day:conditions.day};
}
export function chartDataHTML(chart,{natal=null}={}){
 if(chart.input.astrologyMode!=='classical'){
 const m=aspectMatrix(chart,{natal}),glyph={0:'☌',60:'⚹',90:'□',120:'△',180:'☍'},colors={0:'#a58b59',60:'#6d9079',90:'#b36d78',120:'#6b8fb8',180:'#ac6581'};
 return `<div class="wv-matrix"><div class="wv-frame"><table aria-label="${m.transit?'行运与本命':'主要'}相位矩阵"><thead><tr><th>${m.transit?'运／命':''}</th>${m.columns.map(p=>`<th scope="col">${icon(p.name)}</th>`).join('')}</tr></thead><tbody>${m.rows.map((p,i)=>`<tr><th scope="row">${icon(p.name)}</th>${m.columns.map((q,j)=>{const a=m.cells[i][j];return `<td ${!m.transit&&j>i?'class="wv-unused"':''}>${!m.transit&&j===i?icon(p.name):a?`<button type="button" class="wv-aspect-hit" aria-pressed="false" aria-label="${m.transit?'行运':''}${names[p.name]}与${m.transit?'本命':''}${names[q.name]} · ${a.label}（${a.angle}°），偏差 ${a.orb.toFixed(2)}°，容许度 ${a.limit}°"><span class="wv-aspect-mark" style="color:${colors[a.angle]}">${glyph[a.angle]}</span><small>${a.orb.toFixed(1)}°</small><span class="wv-sr">${names[p.name]}${a.label}${names[q.name]}，偏差${a.orb.toFixed(2)}度，容许度${a.limit}度</span></button>`:''}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div><p class="wv-note">${m.transit?'行运行星 × 本命行星 · ':''}格内数字为相位偏差</p></div>`;
 }
 const d=classicalTableData(chart);
 return `<div class="wv-classical"><div class="wv-frame"><table aria-label="古典行星状态表"><colgroup><col style="width:10%"><col style="width:24%"><col style="width:8%"><col style="width:10%"><col style="width:22%"><col style="width:26%"></colgroup><thead><tr>${['行星','落座','落宫','主宰','尊贵','特殊状态'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${d.rows.map(p=>`<tr><th scope="row">${icon(p.name)}</th><td class="wv-position">${positionHTML(p.longitude)}</td><td>${p.house}</td><td>${p.ruled.join(',')||'—'}</td><td>${p.dignities.map(v=>`<span class="wv-state-tag">${v}</span>`).join(' ')||'—'}</td><td>${p.status.map(v=>`<span class="wv-state-tag">${v}</span>`).join(' ')}</td></tr>`).join('')}</tbody></table></div><p class="wv-note">${d.day?'昼盘':'夜盘'} · 埃及界 · 迦勒底面</p><section class="wv-links"><h4>互容</h4><p>${d.mutual.map(p=>`${names[p.a]} ↔ ${names[p.b]}（${p.ab}／${p.ba}）`).join('；')||'无'}</p><h4>接纳</h4><p>${d.receptions.map(p=>`${names[p.host]}接纳${names[p.guest]}（${p.by}）`).join('；')||'无'}</p><h4>映点 / 反映点</h4><div class="wv-mirrors">${d.rows.map(p=>`<div><span>${names[p.name]}</span><span>${shortPosition(p.antiscion)}</span><span>${shortPosition(p.contraAntiscion)}</span></div>`).join('')}</div></section></div>`;
}
