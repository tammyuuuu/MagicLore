import {GRAHA_METADATA} from '../metadata/grahas.js';

export const HOUSE_POSITIONS={1:[50,24],2:[25,10],3:[10,25],4:[25,50],5:[10,75],6:[25,90],7:[50,76],8:[75,90],9:[90,75],10:[75,50],11:[90,25],12:[75,10]};

export function renderNorthIndianChart(container,chart,{onSelectHouse=()=>{},onSelectGraha=()=>{}}={}){
  container.replaceChildren();
  const frame=document.createElement('div');frame.className='north-chart';frame.setAttribute('aria-label',chart.varga==='D2'?'北印度式 D2 财富分盘':chart.varga==='D10'?'北印度式 D10 十分盘':chart.varga==='D9'?'北印度式 D9 九分盘':'北印度式 D1 本命盘');
  frame.innerHTML='<svg class="chart-lines" viewBox="0 0 100 100" aria-hidden="true"><rect x="1" y="1" width="98" height="98"/><path d="M1 1L99 99M99 1L1 99M50 1L99 50L50 99L1 50Z"/></svg>';
  for(const house of chart.houses){
    const [left,top]=HOUSE_POSITIONS[house.house],grahas=chart.grahas.filter(item=>item.bhava===house.house);
    const cell=document.createElement('div');cell.className='chart-house';cell.dataset.house=house.house;cell.style.left=`${left}%`;cell.style.top=`${top}%`;cell.setAttribute('role','button');cell.tabIndex=0;cell.setAttribute('aria-label',`第${house.house}宫 ${house.sign}`);
    const sign=document.createElement('span');sign.className='chart-sign';sign.textContent=String(house.signIndex+1);cell.append(sign);
    if(house.house===1){const asc=document.createElement('b');asc.className='chart-asc';asc.textContent='Asc';cell.append(asc);}
    const group=document.createElement('span');group.className='chart-grahas';
    for(const graha of grahas){const button=document.createElement('button');button.type='button';button.className='chart-graha';button.dataset.graha=graha.name;button.textContent=GRAHA_METADATA[graha.name].abbreviation+(graha.retrograde?'R':'');button.title=`${graha.name} · ${GRAHA_METADATA[graha.name].chineseName}`;button.onclick=event=>{event.stopPropagation();onSelectGraha(graha.name);};group.append(button);}
    cell.append(group);cell.onclick=()=>onSelectHouse(house.house);cell.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectHouse(house.house);}};frame.append(cell);
  }
  container.append(frame);return frame;
}
