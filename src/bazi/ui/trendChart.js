const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={overall:'综合',career:'事业',wealth:'财运',relationship:'感情'};
export function renderTrendSvg(cycles,theme='overall',selected=0){
 const width=360,height=178,left=27,right=345,top=14,bottom=132;
 const x=i=>cycles.length<=1?(left+right)/2:left+(right-left)*i/(cycles.length-1);
 const y=value=>bottom-(bottom-top)*value/100;
 const paths=[];let segment=[];
 cycles.forEach((c,i)=>{const value=c.scores?.[theme];if(Number.isFinite(value)){segment.push(`${segment.length?'L':'M'}${x(i).toFixed(2)},${y(value).toFixed(2)}`);}else if(segment.length){paths.push(segment.join(' '));segment=[];}});
 if(segment.length)paths.push(segment.join(' '));
 const grid=[0,50,100].map(n=>`<line x1="${left}" x2="${right}" y1="${y(n)}" y2="${y(n)}" class="bt-grid"/><text x="20" y="${y(n)+3}" text-anchor="end" class="bt-axis">${n}</text>`).join('');
 const points=cycles.map((c,i)=>{const v=c.scores?.[theme],known=Number.isFinite(v),cx=x(i),cy=known?y(v):bottom+12;
  return `<g role="button" tabindex="0" data-cycle="${i}" aria-label="${escape(c.pillar)}大运，${labels[theme]}${known?v+'分':'未评分'}" aria-pressed="${i===selected}"><title>${escape(c.pillar)}：${known?v:'未评分'}</title><rect x="${cx-14}" y="${top}" width="28" height="151" fill="transparent" class="bt-hit"/><circle cx="${cx}" cy="${cy}" r="13" fill="transparent"/><circle cx="${cx}" cy="${cy}" r="${i===selected?5:3.5}" class="${known?'bt-point':'bt-missing'}"/><text x="${cx}" y="163" text-anchor="middle" class="bt-axis">${escape(c.displayStartYear??c.startYear)}</text></g>`;
 }).join('');
 return `<svg class="bazi-trend-svg" viewBox="0 0 ${width} ${height}" role="group" aria-label="${labels[theme]}大运规则趋势，未评分位置断开"><g>${grid}</g>${paths.map(d=>`<path d="${d}" class="bt-line"/>`).join('')}${points}</svg>`;
}
