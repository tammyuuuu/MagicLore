const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={overall:'综合',career:'事业',wealth:'财运',relationship:'感情'};
export function renderTrendSvg(cycles,theme='overall',selected=0){
 const width=360,height=178,left=27,right=345,top=14,bottom=132;
 const x=i=>cycles.length<=1?(left+right)/2:left+(right-left)*i/(cycles.length-1);
 const y=value=>bottom-(bottom-top)*value/100;
 const value=c=>c.scores?.[theme];
 const edges=cycles.slice(1).map((c,j)=>{const v=value(cycles[j]),w=value(c);return Number.isFinite(v)&&Number.isFinite(w)?`<path d="M${x(j)},${y(v)} L${x(j+1)},${y(w)}" class="bt-line"/>`:'';}).join('');
 const grid=[0,50,100].map(n=>`<line x1="${left}" x2="${right}" y1="${y(n)}" y2="${y(n)}" class="bt-grid"/><text x="20" y="${y(n)+3}" text-anchor="end" class="bt-axis">${n}</text>`).join('');
 const points=cycles.map((c,i)=>{const v=value(c),known=Number.isFinite(v),cx=x(i),cy=known?y(v):bottom+12,label=known?v+'分':'暂无结果';
  return `<g role="button" tabindex="0" data-cycle="${i}" aria-label="${escape(c.pillar)}大运，${labels[theme]}${label}" aria-pressed="${i===selected}"><title>${escape(c.pillar)}：${label}</title><rect x="${cx-14}" y="${top}" width="28" height="151" fill="transparent" class="bt-hit"/>${known?`<circle cx="${cx}" cy="${cy}" r="${i===selected?5:3.5}" class="bt-point"/>`:''}<text x="${cx}" y="163" text-anchor="middle" class="bt-axis">${escape(c.displayStartYear??c.startYear??'')}</text></g>`;
 }).join('');
 return `<svg class="bazi-trend-svg" viewBox="0 0 ${width} ${height}" role="group" aria-label="${labels[theme]}大运趋势"><g>${grid}</g>${edges}${points}</svg>`;
}
