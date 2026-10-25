import {calculateVedicChart} from '../calculateVedicChart.js';
import {formatDms} from '../zodiac.js';
const $=id=>document.getElementById(id),num=x=>Number(x).toFixed(6)+'°',iso=d=>new Date(d).toISOString();
function render(chart){
  $('currentConvention').textContent=`当前排盘口径：Sidereal · ${chart.ayanamsaLabel} · Whole Sign · ${chart.input.nodeType==='true'?'True':'Mean'} Node`;
  $('inputAudit').innerHTML=`<dt>Local birth datetime</dt><dd>${chart.input.date} ${chart.input.time}</dd><dt>Place</dt><dd>${chart.input.place||'(manual coordinates)'}</dd><dt>Latitude / Longitude</dt><dd>${chart.input.latitude} / ${chart.input.longitude}</dd><dt>Time zone</dt><dd>UTC${chart.input.timezoneOffset} (manual fixed offset)</dd><dt>UTC datetime</dt><dd>${iso(chart.utc)}</dd><dt>Ayanamsa mode</dt><dd>${chart.ayanamsaLabel}</dd><dt>Node mode</dt><dd>${chart.input.nodeType.toUpperCase()} NODE</dd>`;
  $('astroAudit').innerHTML=`<dt>Julian Day (UT)</dt><dd>${chart.times.jd.toFixed(9)}</dd><dt>Julian Ephemeris Day (TT)</dt><dd>${chart.times.jde.toFixed(9)}</dd><dt>ΔT</dt><dd>${chart.times.deltaTSeconds.toFixed(3)} s</dd><dt>Tropical Ascendant</dt><dd>${num(chart.lagna.tropicalLongitude)}</dd><dt>${chart.ayanamsaLabel} Ayanamsa</dt><dd>${num(chart.ayanamsa)}</dd><dt>Sidereal Ascendant</dt><dd>${num(chart.lagna.siderealLongitude)}</dd><dt>Lagna</dt><dd>${chart.lagna.sign} ${formatDms(chart.lagna.siderealLongitude)}</dd>`;
  $('grahaRows').innerHTML=chart.grahas.map(g=>`<tr><th>${g.name}</th><td>${num(g.tropicalLongitude)}</td><td>${num(g.siderealLongitude)}</td><td>${g.sign}</td><td>${formatDms(g.siderealLongitude)}</td><td>${g.bhava}</td><td>${g.nakshatra.name}<small>#${g.nakshatra.number}; within ${g.nakshatra.withinDegrees.toFixed(6)}°</small></td><td>${g.nakshatra.pada}</td><td>${g.retrograde?'R':'—'}</td><td>${g.dignity||'—'}</td></tr>`).join('');
  $('houseRows').innerHTML=chart.houses.map(h=>`<tr><td>${h.house}</td><td>${h.sign}</td><td>${h.house===1?'Lagna':''}</td></tr>`).join('');
  $('dashaSummary').textContent=`At birth: ${chart.dasha.currentLord} Mahadasha | elapsed ${chart.dasha.elapsedYears.toFixed(8)} years | remaining ${chart.dasha.remainingYears.toFixed(8)} years | ${iso(chart.dasha.currentStart)} → ${iso(chart.dasha.currentEnd)}`;
  $('dashaRows').innerHTML=chart.dasha.timeline.map(x=>`<tr><th>${x.lord}</th><td>${iso(x.start)}</td><td>${iso(x.end)}</td><td>${x.durationYears} years</td></tr>`).join('');
  $('checks').innerHTML=chart.validation.map(x=>`<li class="${x.pass?'pass':'fail'}"><b>${x.pass?'PASS':'FAIL'}</b> ${x.name}<small>${x.detail}</small></li>`).join('');
  $('raw').textContent=JSON.stringify(chart,(key,value)=>value instanceof Date?value.toISOString():value,2);$('output').hidden=false;
}
$('vedicForm').addEventListener('submit',event=>{event.preventDefault();$('error').textContent='';try{render(calculateVedicChart({date:$('date').value,time:$('time').value,place:$('place').value,latitude:Number($('latitude').value),longitude:Number($('longitude').value),timezoneOffset:$('timezone').value},{nodeType:$('nodeType').value,ayanamsaMode:$('ayanamsaMode').value}));}catch(error){$('error').textContent=String(error.message||error);}});
$('ayanamsaMode').addEventListener('change',()=>$('vedicForm').requestSubmit());
$('nodeType').addEventListener('change',()=>$('vedicForm').requestSubmit());
$('vedicForm').requestSubmit();
