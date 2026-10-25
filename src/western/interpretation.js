import {houseOf} from './calculateWesternChart.js';
const signs=['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const modes=['主动尝试、直接表达','稳步积累、重视具体感受','交换信息、探索多种角度','关注情感联结与归属','表达创造力、希望被看见','分析细节、改善流程','协调关系、比较不同立场','深入探索、重视信任边界','拓展视野、寻找意义','制定计划、承担责任','独立思考、尝试新的规则','感受氛围、运用想象与共情'];
const houses=['自我呈现与行动起点','资源、价值感与日常积累','学习、交流与身边环境','家庭、私人空间与内在根基','创造、自我表达与玩乐','日常工作、习惯与服务','一对一关系、协商与合作','共享资源、亲密与变化','高等学习、远行与信念','事业方向、公共角色与责任','社群、共同目标与长期愿景','独处、休整与不易察觉的内在过程'];
const meanings={Sun:['太阳','自我认同与主动选择'],Moon:['月亮','情绪反应与安全感'],Mercury:['水星','思考、沟通与学习'],Venus:['金星','关系偏好、审美与价值选择'],Mars:['火星','行动、欲望与边界表达'],Jupiter:['木星','成长、探索与信念'],Saturn:['土星','责任、界限与长期建设'],Uranus:['天王星','独立、变化与突破惯例'],Neptune:['海王星','想象、理想与感受边界'],Pluto:['冥王星','深层变化、控制与重建']};
meanings.MC=['天顶','事业方向与公共角色'];
const aspects={0:['合相','两个主题集中在一起，适合辨认它们如何相互强化，也留意是否难以分开处理'],60:['六合','两个主题之间存在可以主动培养的合作空间，需要用具体行动把机会连接起来'],90:['刑相','两个主题之间需要调整节奏与优先级，适合把矛盾拆成可执行的小步骤'],120:['拱相','两个主题较容易相互支持，可以运用已有长处，同时避免只停留在熟悉的方式'],180:['对冲','两个主题呈现不同需求，适合练习协商、边界与兼顾，而非只选择其中一端']};
export function natalReading(chart){return {core:[['上升',chart.asc,'接近新环境和开始行动的方式'],['太阳',chart.planets.find(p=>p.name==='Sun').longitude,'主动发展的自我方向'],['月亮',chart.planets.find(p=>p.name==='Moon').longitude,'情绪调节与安全感需要']].map(([name,longitude,topic])=>({title:`${name} · ${signs[Math.floor(longitude/30)]}`,text:`${topic}，可从「${modes[Math.floor(longitude/30)]}」这一象征角度阅读。需要结合整张盘及实际经历理解。`})),planets:chart.planets.filter(p=>meanings[p.name]).map(p=>({title:`${meanings[p.name][0]} · ${signs[Math.floor(p.longitude/30)]} · 第${p.house}宫`,text:`${meanings[p.name][1]}以「${modes[Math.floor(p.longitude/30)]}」的方式表达，主要关联${houses[p.house-1]}。${p.retrograde?'逆行可作为反思这个主题的提示，不等同于能力受限。':''}`})),aspects:chart.aspects.map(a=>({title:`${meanings[a.a][0]}${a.label}${meanings[a.b][0]} · 偏差${a.orb.toFixed(2)}°`,text:`${meanings[a.a][1]}与${meanings[a.b][1]}：${aspects[a.angle][1]}。`}))};}
export function transitReading(natal,current){const hits=[];for(const t of current.planets.filter(p=>meanings[p.name]))for(const n of natal.planets.concat(Number.isFinite(natal.mc)?[{name:'MC',longitude:natal.mc}]:[]).filter(p=>meanings[p.name])){const gap=Math.abs(((t.longitude-n.longitude+540)%360)-180);for(const angle of [0,60,90,120,180]){const orb=Math.abs(gap-angle);if(orb<=3)hits.push({title:`行运${meanings[t.name][0]}${aspects[angle][0]}本命${meanings[n.name][0]}`,text:`偏差${orb.toFixed(2)}°；行运${meanings[t.name][0]}落本命第${houseOf(t.longitude,natal.cusps)}宫，关联${houses[houseOf(t.longitude,natal.cusps)-1]}。${meanings[t.name][1]}与本命${meanings[n.name][1]}：${aspects[angle][1]}。`,orb});}}return hits.sort((a,b)=>a.orb-b.orb);}
const pairThemes={
 'Sun:Uranus':['需要自己的空间，才能发展独立方向','能看见惯例之外的可能，愿意调整不适合自己的规则。','想保留自主权，却可能突然抽离或改变决定，让别人难以理解。','先说清需要改变的部分，试行一个小方案，再决定是否彻底转向。'],
 'Moon:Mars':['情绪与行动紧密相连','感受到需求后能很快行动，也容易主动保护在意的人。','感受还没有被说清，行动或反驳就已经发生；累积疲惫时尤其需要留意。','在答应、拒绝或争论前，先给感受命名，再选择行动。'],
 'Sun:Saturn':['自我要求与长期建设','有耐心把目标落实，也能承担持续的责任。','容易把表现与自我价值绑在一起，休息时也可能觉得不够好。','把必要标准和额外要求分开，给完成而非完美留出位置。'],
 'Moon:Saturn':['安全感与责任之间的平衡','能在压力下照顾现实需要，建立可靠的生活结构。','可能先处理责任，再承认自己的情绪需要。','把休息和求助写进安排，不必等所有事情做完。'],
 'Mercury:Uranus':['独立思考与表达节奏','容易提出新角度，把不同线索连接起来。','思路跳跃时，别人可能跟不上推理过程。','表达结论之前，补上两三步具体依据。'],
 'Venus:Mars':['亲近方式与行动欲望','能主动经营关系，把喜欢落实为行动。','想靠近与想掌握节奏可能同时出现，需要核对双方意愿。','把期待、边界和行动分开沟通。']
};
export function natalFocus(chart){
 const personal=['Sun','Moon','Mercury','Venus','Mars'];
 const candidates=chart.aspects.filter(a=>personal.includes(a.a)||personal.includes(a.b)).map(a=>{
 const p=chart.planets.find(p=>p.name===a.a),q=chart.planets.find(p=>p.name===a.b);
 const data=pairThemes[`${a.a}:${a.b}`]||pairThemes[`${a.b}:${a.a}`]||[`${meanings[a.a][0]}与${meanings[a.b][0]}的需求如何配合`,`${meanings[a.a][1]}与${meanings[a.b][1]}可以成为彼此的补充。`,aspects[a.angle][1]+'。',`在${houses[p.house-1]}与${houses[q.house-1]}之间，分别列出一个当前需要，再安排具体优先级。`];
 return {title:data[0],evidence:`${meanings[a.a][0]}${signs[Math.floor(p.longitude/30)]}第${p.house}宫 · ${meanings[a.b][0]}${signs[Math.floor(q.longitude/30)]}第${q.house}宫 · ${a.label}，偏差${a.orb.toFixed(2)}°`,strength:data[1],tension:data[2],action:data[3],score:(['Sun','Moon'].includes(a.a)||['Sun','Moon'].includes(a.b)?20:10)-a.orb,text:`这些需求通过${a.label}联结，主要在${houses[p.house-1]}${p.house===q.house?'':`、${houses[q.house-1]}`}中体现。`};
 }).sort((a,b)=>b.score-a.score).slice(0,2);
 const rulers=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
 const ruler=chart.planets.find(p=>p.name===rulers[Math.floor(chart.asc/30)]);
 candidates.push({title:`把成长落在${houses[ruler.house-1]}`,evidence:`上升${signs[Math.floor(chart.asc/30)]} · 传统守护星${meanings[ruler.name][0]}${signs[Math.floor(ruler.longitude/30)]}第${ruler.house}宫`,text:`面对新环境时倾向${modes[Math.floor(chart.asc/30)]}；守护星把这一方向带入${houses[ruler.house-1]}，表达方式则偏向${modes[Math.floor(ruler.longitude/30)]}。`,strength:`可以通过${houses[ruler.house-1]}建立可依赖的行动基础。`,tension:'外在适应方式与实际投入的节奏未必相同，容易为了适应环境而忽略自己的优先级。',action:`选择一项与${houses[ruler.house-1]}有关的具体目标，记录投入与反馈，检验它是否支持你想发展的方向。`});
 return candidates;
}
export function transitFocus(items){
 const weights={Pluto:9,Neptune:8,Uranus:8,Saturn:9,Jupiter:7,Mars:4,Venus:3,Mercury:3,Sun:2,Moon:1};
 const ranked=items.map(item=>{const t=Object.keys(meanings).find(k=>item.title.startsWith('行运'+meanings[k][0]));const n=Object.keys(meanings).find(k=>item.title.endsWith('本命'+meanings[k][0]));return {...item,score:weights[t]*3+(['Sun','Moon','MC'].includes(n)?24:['Mercury','Venus','Mars'].includes(n)?18:0)-item.orb,transitPlanet:t};}).sort((a,b)=>b.score-a.score);
 return {focus:ranked.filter(i=>!['Sun','Moon'].includes(i.transitPlanet)).slice(0,3).map(i=>({...i,evidence:`偏差${i.orb.toFixed(2)}° · ${weights[i.transitPlanet]>=7?'慢行星主题，适合持续观察':'近期行动与关系主题'}`,action:i.title.includes('本命水星')?'留意学习计划、信息处理与沟通方式的变化；重要决定先核对事实，再给新想法安排小规模试行。':i.title.includes('本命太阳')?'核对当前机会是否符合自己的方向，区分主动选择与为了回应外界期待而做出的承诺。':i.title.includes('本命月亮')?'记录情绪、休息与亲近关系中的实际需要，安排可以持续的支持方式。':i.title.includes('本命金星')?'核对关系与消费中的期待，明确双方意愿和现实预算。':i.title.includes('本命火星')?'把行动目标与精力安排配对，遇到阻力时先调整步骤与边界。':'结合当前实际事项记录变化；精确发生日期与持续时间需要进一步追踪，单个时刻不能判断。'})),short:ranked.filter(i=>['Sun','Moon'].includes(i.transitPlanet)),all:ranked};
}
export function readingHTML(title,items){return `<section class="western-reading"><h2>${title}</h2><div class="western-reading-grid">${items.map(item=>`<article><h3>${item.title}</h3>${item.meta?`<p class="reading-meta">${item.meta}</p>`:''}${item.evidence?`<p class="reading-evidence">${item.evidence}</p>`:''}${item.paragraphs?item.paragraphs.map(p=>`<p class="reading-detail">${emphasizeTransit(p)}</p>`).join(''):`<p>${item.text}</p>`}${[['strength','优势'],['tension','需要协调'],['action','观察建议']].map(([key,label])=>item[key]?`<p class="reading-detail"><strong>${label}</strong> ${item[key]}</p>`:'').join('')}</article>`).join('')}</div></section>`;}
function emphasizeTransit(text){if(text.includes('**'))return text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');let count=0;const seen=new Set();return text.replace(/行运(?:太阳|月亮|水星|金星|火星|木星|土星|天王星|海王星|冥王星)|本命(?:太阳|月亮|水星|金星|火星|木星|土星|天王星|海王星|冥王星)|第\d+宫|天顶/g,term=>{if(count>=3||seen.has(term))return term;seen.add(term);count++;return `<strong>${term}</strong>`;});}
export const readingNote='<p class="note">以下采用西洋占星的基础象征规则，供自我观察；单一配置不能推出具体人生事件。<a href="https://www.astro.com/astrowiki/en/Transits" target="_blank" rel="noopener">阅读行运与相位说明</a></p>';


