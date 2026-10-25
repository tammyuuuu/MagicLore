/* Shared local birthplace catalogue; coordinate coverage is checked by tests/western/chinaPlaces.test.js. */
(async()=>{
 const western=!!document.getElementById('wPlace');
 const place=document.getElementById(western?'wPlace':'birthPlace');
 if(!place)return;
 const latitude=document.getElementById(western?'wLatitude':'latitude'),longitude=document.getElementById(western?'wLongitude':'longitude');
 const note=document.createElement('small');note.className='china-place-note';note.setAttribute('aria-live','polite');
 const manual=document.createElement('button');manual.type='button';manual.className='quiet-btn china-place-manual';manual.textContent='使用自定义坐标';
 place.parentElement.append(note,manual);
 place.placeholder='输入城市或区县，选择完整地点';place.autocomplete='off';
 let rows,manualMode=false;
 const coordinateLabels=[latitude.closest('label'),longitude.closest('label')];
 if(!western){const coordinates=document.createElement('div');coordinates.className='birth-location-details vedic-custom-coordinates';coordinates.hidden=true;coordinates.append(...coordinateLabels);place.parentElement.append(coordinates);}
 function coordinateMode(show){coordinateLabels.forEach(label=>label.hidden=!show);const details=place.parentElement.querySelector('.vedic-custom-coordinates');if(details)details.hidden=!show;}
 coordinateMode(false);
 rows=Array.isArray(window.CHINA_BIRTHPLACES)?window.CHINA_BIRTHPLACES:[];
 function resolve(value){let row=rows.find(r=>r.path===value);if(row)return row;const matches=rows.filter(r=>r.name===value||r.name.replace(/市$/,'')===value);return matches.length===1?matches[0]:null;}
 function select(){if(manualMode){place.setCustomValidity('');return;}const row=resolve(place.value.trim());if(!row){place.setCustomValidity('请从候选地点选择完整名称，或点击使用自定义坐标。');note.textContent='同名地点请选择省、市、区县完整名称。';return;}
 place.value=row.path;place.setCustomValidity('');
 if(row.lat===null||row.lng===null){latitude.value='';longitude.value='';note.textContent='该地点暂无参考坐标，请手动填写经纬度。';return;}
 latitude.value=row.lat;longitude.value=row.lng;note.textContent='已填入地点参考坐标，可手动调整到具体出生位置。';
 latitude.dispatchEvent(new Event('change',{bubbles:true}));longitude.dispatchEvent(new Event('change',{bubbles:true}));
 }
 place.addEventListener('input',select);place.addEventListener('change',select);
 const panel=document.createElement('div');panel.className='china-place-browser china-place-regions';
 const province=document.createElement('select'),city=document.createElement('select'),district=document.createElement('select');
 province.setAttribute('aria-label','省');city.setAttribute('aria-label','市');district.setAttribute('aria-label','区');
 province.append(new Option('请选择省份',''));for(const row of rows.filter(r=>r.level===0))province.append(new Option(row.path,row.id));
 panel.append(province,city,district);place.parentElement.insertBefore(panel,note);place.style.display='none';
 const descendants=(row,level)=>rows.filter(r=>r.level===level&&r.path.startsWith(row.path+' '));
 function fillDistrict(){district.replaceChildren(new Option('全市（市中心）',''));const row=rows.find(r=>r.id===city.value);if(row)for(const r of descendants(row,2))district.append(new Option(r.name,r.id));district.disabled=!row;}
 function fillCity(){city.replaceChildren(new Option('请选择城市',''));const row=rows.find(r=>r.id===province.value);if(row)for(const r of descendants(row,1))city.append(new Option(r.name,r.id));city.disabled=!row;fillDistrict();}
 function applyRegion(){const row=rows.find(r=>r.id===(district.value||city.value));if(!row){place.value='';latitude.value='';longitude.value='';place.setCustomValidity('请先选择城市。');return;}place.value=row.path;select();}
 province.onchange=()=>{fillCity();applyRegion();};city.onchange=()=>{fillDistrict();applyRegion();};district.onchange=applyRegion;
 const initial=rows.find(r=>r.level===0&&place.value.startsWith(r.path));if(initial)province.value=initial.id;fillCity();
 const initialCity=rows.find(r=>r.level===1&&place.value.startsWith(r.path));if(initialCity){city.value=initialCity.id;fillDistrict();const initialDistrict=rows.find(r=>r.level===2&&place.value===r.path);if(initialDistrict)district.value=initialDistrict.id;}else if(city.options.length===2){city.selectedIndex=1;fillDistrict();}
 manual.onclick=()=>{manualMode=!manualMode;place.setCustomValidity('');manual.textContent=manualMode?'返回省市区选择':'使用自定义坐标';panel.hidden=manualMode;coordinateMode(manualMode);place.style.display=manualMode?'':'none';if(manualMode){place.placeholder='输入地点名称';note.textContent='自定义模式：请填写地点名称和经纬度。';}else{applyRegion();}};
 window.addEventListener('magiccat-place-restored',()=>{
  const initial=rows.find(r=>r.level===0&&place.value.startsWith(r.path));province.value=initial?.id||'';fillCity();
  const c=rows.find(r=>r.level===1&&place.value.startsWith(r.path));if(c){city.value=c.id;fillDistrict();district.value=rows.find(r=>r.level===2&&r.path===place.value)?.id||'';}else if(city.options.length===2){city.selectedIndex=1;fillDistrict();}
  manualMode=!initial;panel.hidden=manualMode;coordinateMode(manualMode);place.style.display=manualMode?'':'none';manual.textContent=manualMode?'返回省市区选择':'使用自定义坐标';
 });
 // Preserve existing sample or restored coordinates; do not silently alter an existing chart.
 note.textContent=rows.length?`可搜索全国省、市、区县（${rows.length}个地点）；经纬度仍可手动填写。`:'城市数据暂不可用，仍可使用自定义坐标。';
})();
