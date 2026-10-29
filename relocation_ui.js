/* Residence and relocation use the same local city catalogue; no network geocoding. */
(()=>{
 if(document.body.dataset.librarySystem!=='western')return;
 const $=id=>document.getElementById(id),api=()=>window.magiccatAstrology;
 const key='magiccat_western_chart_archive_v1';
 const read=()=>{const rows=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(rows))throw new Error('档案格式无法读取。');return rows;};
 function picker(host,label){
  let rows=window.CHINA_BIRTHPLACES||[];const box=document.createElement('fieldset');box.className='residence-picker';
  const legend=document.createElement('legend');legend.textContent=label;box.append(legend);
  const regions=document.createElement('div');regions.className='china-place-regions';
  const province=document.createElement('select'),city=document.createElement('select'),district=document.createElement('select');
  for(const [control,name] of [[province,'省'],[city,'市'],[district,'区']])control.setAttribute('aria-label',label+name);
  regions.append(province,city,district);box.append(regions);
  const manual=document.createElement('button');manual.type='button';manual.className='quiet-btn';manual.textContent='使用自定义地点';box.append(manual);
  const details=document.createElement('div');details.className='residence-coordinates';
  function field(name,type){const wrap=document.createElement('label');wrap.textContent=name;const input=document.createElement('input');input.type=type;input.setAttribute('aria-label',label+name);if(type==='number')input.step='any';wrap.append(input);details.append(wrap);return input;}
  const place=field('地点名称','text'),latitude=field('纬度','number'),longitude=field('经度','number');place.placeholder='输入地点名称';latitude.min=-89;latitude.max=89;longitude.min=-180;longitude.max=180;
  details.hidden=true;box.append(details);const note=document.createElement('p');note.className='note';note.textContent='可选择全国省、市、区；境外城市或缺少坐标的地点，可手动填写。';box.append(note);host.append(box);
  let manualMode=false;
  function cities(){city.replaceChildren(new Option('请选择城市',''));const p=rows.find(r=>r.id===province.value);for(const r of rows.filter(r=>r.level===1&&p&&r.path.startsWith(p.path+' ')))city.append(new Option(r.name,r.id));districts();}
  function districts(){district.replaceChildren(new Option('全市（市中心）',''));const c=rows.find(r=>r.id===city.value);for(const r of rows.filter(r=>r.level===2&&c&&r.path.startsWith(c.path+' ')))district.append(new Option(r.name,r.id));}
  function apply(){const r=rows.find(r=>r.id===(district.value||city.value));place.value=r?.path||'';latitude.value=r?.lat??'';longitude.value=r?.lng??'';note.textContent=r?(r.lat==null||r.lng==null?'此地点暂无坐标，请手动补充纬度和经度。':'已填入地点参考坐标，可以按实际位置调整。'):'请选择省、市、区。';}
  function provinces(){province.replaceChildren(new Option('请选择省份',''));for(const r of rows.filter(r=>r.level===0))province.append(new Option(r.path,r.id));cities();}provinces();
  province.onchange=()=>{cities();apply();};city.onchange=()=>{districts();apply();};district.onchange=apply;
  manual.onclick=()=>{manualMode=!manualMode;regions.hidden=manualMode;details.hidden=!manualMode;manual.textContent=manualMode?'返回省市区选择':'使用自定义地点';place.readOnly=!manualMode;};place.readOnly=true;
  const control={get(){if(!place.value&&!latitude.value&&!longitude.value)return null;if(!place.value||latitude.value===''||longitude.value==='')throw new Error('请补全'+label+'名称、纬度和经度。');return {place:place.value,latitude:Number(latitude.value),longitude:Number(longitude.value)};},set(value){province.value='';cities();place.value=value?.place||'';latitude.value=value?.latitude??'';longitude.value=value?.longitude??'';const p=rows.find(r=>r.level===0&&value?.place?.startsWith(r.path));if(p){province.value=p.id;cities();const c=rows.find(r=>r.level===1&&value.place.startsWith(r.path));if(c){city.value=c.id;districts();district.value=rows.find(r=>r.level===2&&r.path===value.place)?.id||'';}}manualMode=!!value&&!p;regions.hidden=manualMode;details.hidden=!manualMode;place.readOnly=!manualMode;manual.textContent=manualMode?'返回省市区选择':'使用自定义地点';window.dispatchEvent(new Event('magiccat-place-restored'));},box};
  window.addEventListener('magiccat-place-data-ready',()=>{const saved=place.value||latitude.value||longitude.value?{place:place.value,latitude:latitude.value,longitude:longitude.value}:null;rows=window.CHINA_BIRTHPLACES||[];provinces();control.set(saved);});
  return control;
 }
 const residenceHost=document.createElement('div');residenceHost.className='residence-host';
 const locationRow=document.createElement('div');locationRow.className='birth-location-row';
 const birthLocation=$('wPlace').closest('label');birthLocation.classList.add('birth-place-field');locationRow.append(birthLocation,residenceHost);
 $('westernForm').querySelector('.form-grid').after(locationRow);
 const birthCoordinates=document.createElement('div');birthCoordinates.className='residence-coordinates birth-location-details';birthCoordinates.hidden=true;
 const placeName=document.createElement('label');placeName.textContent='地点名称';$('wPlace').placeholder='输入地点名称';placeName.append($('wPlace'));
 const latLabel=$('wLatitude').closest('label'),lngLabel=$('wLongitude').closest('label');latLabel.firstChild.textContent='纬度';lngLabel.firstChild.textContent='经度';
 birthCoordinates.append(placeName,latLabel,lngLabel);birthLocation.append(birthCoordinates);
 window.magiccatResidence=picker(residenceHost,'现居地（可选）');
 const page=document.createElement('section');page.className='library-module-page library-relocation-page';page.hidden=true;
 page.innerHTML='<h1>重置盘</h1><p>选择本命档案与现居城市，对照四轴和宫位的变化。也可以选择其他城市，加入对比。</p><form class="relocation-form"><label>选择本命档案<select aria-label="重置盘选择本命档案"></select></label><div class="relocation-destination"></div><div class="relocation-actions"><button type="submit" class="quiet-btn">生成重置盘</button><button type="button" class="quiet-btn relocation-compare">加入城市对比</button></div></form><p class="relocation-status note" role="status"></p><div class="relocation-comparisons"></div><div class="relocation-output"></div>';
 document.body.append(page);const target=picker(page.querySelector('.relocation-destination'),'重置城市');
 const select=page.querySelector('select'),status=page.querySelector('.relocation-status'),output=page.querySelector('.relocation-output'),comparison=page.querySelector('.relocation-comparisons');
 let last,comparisons=[];
 const birth=()=>{const row=read().find(r=>String(r.id)===select.value);if(select.value&&!row)throw new Error('所选档案已不可用，请重新选择。');return row?row.input:api().getInput();};
 function refresh(){const previous=select.value;select.replaceChildren(new Option('当前本命资料（未选择档案）',''));try{for(const r of read())select.append(new Option(r.title+' · '+r.input.date,String(r.id)));select.value=previous;if(!select.value)select.value='';return previous!==select.value;}catch(e){status.textContent=e.message;}}
 function changeSource(){try{target.set(birth().residence||null);output.replaceChildren();comparison.replaceChildren();comparisons=[];last=null;status.textContent='选择目的地后生成重置盘。旧档案没有现居地时可以直接在这里选择。';}catch(e){status.textContent=e.message;}}
 select.onchange=changeSource;
 const signs=['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
 const pos=x=>signs[Math.floor(x/30)]+' '+(x%30).toFixed(3)+'°';
 function generate(){const input=birth(),destination=target.get();last=null;const result=api().relocation(input,destination);output.replaceChildren();
  const summary=document.createElement('p');summary.textContent=`重置城市：${destination.place} · 纬度${destination.latitude} / 经度${destination.longitude} · 出生UTC ${result.natal.utc} · ${input.system}`;output.append(summary);
  const charts=document.createElement('div');charts.className='library-transit-charts';for(const [title,c] of [['出生地本命盘',result.natal],['目的地重置盘',result.relocated]]){const panel=document.createElement('div'),heading=document.createElement('h2'),host=document.createElement('div');heading.textContent=title;host.className='chart-paper';panel.append(heading,host);charts.append(panel);api().draw(c.input,host);}output.append(charts);
  const angles=document.createElement('p');angles.className='note';angles.textContent=`上升：${pos(result.natal.asc)} → ${pos(result.relocated.asc)}；天顶：${pos(result.natal.mc)} → ${pos(result.relocated.mc)}`;output.append(angles);
  const scroll=document.createElement('div');scroll.className='table-scroll';const table=document.createElement('table');table.innerHTML='<thead><tr><th>星体</th><th>出生地宫位</th><th>重置宫位</th><th>变化</th></tr></thead>';const tbody=document.createElement('tbody');const names={Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',NorthNode:'北交点',SouthNode:'南交点'};for(const p of result.relocated.planets){const original=result.natal.planets.find(n=>n.name===p.name);const tr=document.createElement('tr');for(const text of [names[p.name],`第${original.house}宫`,`第${p.house}宫`,original.house===p.house?'保持':'转入新的宫位']){const td=document.createElement('td');td.textContent=text;tr.append(td);}tbody.append(tr);}table.append(tbody);scroll.append(table);output.append(scroll);
  const reading=document.createElement('div');reading.className='relocation-reading';reading.innerHTML=api().relocationReading(result);output.append(reading);
  const note=document.createElement('p');note.className='note';note.innerHTML='重置盘保留出生瞬间，重新计算目的地四轴和宫位。星级表示领域突出度，发展支持与需要投入的部分在正文分别说明。<a href="https://www.astro.com/astrowiki/en/Relocation_astrology" target="_blank" rel="noopener">重置盘的计算与解释依据</a>';output.append(note);status.textContent='已生成。出生时刻、行星星座度数及行星之间相位保持不变；现居地不需要改写出生时区。';last=result;return result;
 }
 page.querySelector('form').onsubmit=e=>{e.preventDefault();try{generate();}catch(e){output.replaceChildren();status.textContent=e.message;}};
 page.querySelector('.relocation-compare').onclick=()=>{try{const result=generate();const destination=result.destination;const cityKey=destination.latitude+':'+destination.longitude;comparisons=comparisons.filter(r=>r.key!==cityKey);comparisons.push({key:cityKey,place:destination.place,themes:api().relocationThemes(result)});comparison.replaceChildren();const heading=document.createElement('h2');heading.textContent='城市对比 · 领域突出度';comparison.append(heading);const wrap=document.createElement('div');wrap.className='table-scroll';const table=document.createElement('table');table.innerHTML='<thead><tr><th>城市</th><th>前三个突出领域</th><th>可培养的发展支持</th><th>需要投入与协调</th><th>移出对比</th></tr></thead>';const tbody=document.createElement('tbody');for(const city of comparisons){const tr=document.createElement('tr'),name=document.createElement('td'),themes=document.createElement('td'),support=document.createElement('td'),demand=document.createElement('td'),action=document.createElement('td'),remove=document.createElement('button');name.textContent=[...new Set(city.place.split(/\s+/))].join(' · ');themes.textContent=city.themes.slice(0,3).map(r=>r.title.split(' · ')[0]+' '+ '★'.repeat(r.stars)).join(' / ');support.textContent=city.themes.filter(r=>r.supportText).slice(0,3).map(r=>r.title.split(' · ')[0]+'：'+r.supportText).join(' / ')||'以宫主星联系为主，结合下方正文观察';demand.textContent=city.themes.filter(r=>r.demandText).slice(0,3).map(r=>r.title.split(' · ')[0]+'：'+r.demandText).join(' / ')||'结合实际成本与生活安排判断';remove.type='button';remove.textContent='移出';remove.className='quiet-btn';remove.onclick=()=>{comparisons=comparisons.filter(r=>r.key!==city.key);tr.remove();};action.append(remove);tr.append(name,themes,support,demand,action);tbody.append(tr);}table.append(tbody);wrap.append(table);comparison.append(wrap);status.textContent='已加入本次城市对比。切换本命档案会清空对比，以免混用不同人的资料。';}catch(e){status.textContent=e.message;}};
 function route(){page.hidden=location.hash!=='#relocation';if(!page.hidden){const changed=refresh();if(changed||!last)changeSource();}}
 window.addEventListener('hashchange',route);window.addEventListener('magiccat-archive-updated',()=>{refresh();if(!page.hidden)changeSource();});route();
})();
