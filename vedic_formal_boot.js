(function(){
  const baseUrl=document.currentScript.src;
  const themeStyle=document.createElement('link');themeStyle.rel='stylesheet';themeStyle.href=new URL('vedic_themes.css?v=m133',baseUrl).href;document.head.append(themeStyle);
  const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('vedic_reading.css',baseUrl).href;document.head.appendChild(style);
  const relationStyle=document.createElement('link');relationStyle.rel='stylesheet';relationStyle.href=new URL('vedic_relations.css',baseUrl).href;document.head.appendChild(relationStyle);
  const interpretationStyle=document.createElement('link');interpretationStyle.rel='stylesheet';interpretationStyle.href=new URL('vedic_interpretation.css',baseUrl).href;document.head.appendChild(interpretationStyle);
  const readerStyle=document.createElement('link');readerStyle.rel='stylesheet';readerStyle.href=new URL('vedic_reader.css',baseUrl).href;document.head.appendChild(readerStyle);
  const houseFullscreenStyle=document.createElement('link');houseFullscreenStyle.rel='stylesheet';houseFullscreenStyle.href=new URL('vedic_house_fullscreen.css',baseUrl).href;document.head.appendChild(houseFullscreenStyle);
  function fail(error){const target=document.getElementById('formError');if(target)target.textContent=`Page startup failed: ${error.message||error}`;console.error(error);}
  function load(src,onload){const script=document.createElement('script');script.src=new URL(src,baseUrl).href;script.onload=onload;script.onerror=()=>fail(new Error(`Unable to load ${src}`));document.head.appendChild(script);}
  load('vendor/astronomy-engine.min.js',()=>load('vedic_formal_app.js?v=m133',()=>{}));
})();









