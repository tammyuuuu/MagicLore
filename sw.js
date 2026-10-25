// Bump VERSION for every deployment. Stage only the shell and previously visited assets.
const BASE=new URL('./',self.location.href),PREFIX='magiclore-'+encodeURIComponent(BASE.pathname)+'-';
const VERSION='20261025-90',RELEASE=PREFIX+VERSION,CORE=RELEASE+'-core',RUNTIME=RELEASE+'-visited',STATE=PREFIX+'state';
const core=['./','index.html','mobile.css','typography.css','home.css','home-icons.js','assets/home/hero.webp','assets/home/archive.webp','assets/home/notes.webp','assets/home/knowledge.webp','entry-loader.js','app.js','notes-store.js','notes-ui.js','notes-knowledge.js','notes.css','chart-profile.js','profiles-ui.js','person-editor.js','profile-birth-picker.js','profiles.css','person-store.js','profile-time.js','profile-calendar-loader.js','profile-store.js','pwa.js','manifest.webmanifest','icons/icon-192.webp','icons/icon-512.webp','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','offline.html'];
const belongs=key=>key.startsWith(PREFIX)||(BASE.pathname==='/'&&/^magiclore-20261024-[1-4]-/.test(key));
self.addEventListener('install',event=>event.waitUntil((async()=>{
  try{
  const shell=await caches.open(CORE);
  const metadata=await fetch(new URL('asset-manifest.json',BASE),{cache:'reload'});
  if(!metadata.ok)throw Error('Missing release manifest');
  const manifest=await metadata.clone().json();
  await shell.put(new URL('asset-manifest.json',BASE),metadata);
  async function stage(path,cache){const request=new Request(new URL(path,BASE),{cache:'reload'}),response=await fetch(request);if(!response.ok)throw Error('Release asset missing: '+path);const expected=manifest.files[path==='./'?'index.html':path];if(!expected)throw Error('Unknown release asset: '+path);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==expected)throw Error('Incomplete deployment: '+path);await cache.put(request,response);}
  await Promise.all(core.map(path=>stage(path,shell)));
  // All used modules must stage successfully. Failure leaves the old worker active.
  const active=await (await caches.open(STATE)).match(new URL('active-release',BASE));
  const previous=active?(await active.text())+'-visited':(await caches.keys()).filter(key=>belongs(key)&&key.endsWith('-visited')&&key!==RUNTIME).pop();
  if(previous){const old=await caches.open(previous),next=await caches.open(RUNTIME),paths=new Set();for(const request of await old.keys()){const path=new URL(request.url).pathname.slice(BASE.pathname.length);if(manifest.files[path])paths.add(path);for(const dependency of manifest.modules[path]||[])paths.add(dependency);}await Promise.all([...paths].map(path=>stage(path,next)));}
  }catch(error){await caches.delete(CORE);await caches.delete(RUNTIME);throw error;}
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await self.clients.claim();
  await (await caches.open(STATE)).put(new URL('active-release',BASE),new Response(RELEASE));
  for(const key of await caches.keys())if(belongs(key)&&key!==CORE&&key!==RUNTIME&&key!==STATE)await caches.delete(key);
})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  // Only static code and assets are cached. Records live separately in localStorage.
  if(!/\.(html|js|css|json|svg|png|webp|webmanifest)$/.test(url.pathname)&&url.pathname!==BASE.pathname)return;
  url.search='';url.hash='';const key=url.href;
  event.respondWith((async()=>{
    const shell=await caches.open(CORE),visited=await caches.open(RUNTIME);
    const cached=await shell.match(key)||await visited.match(key);if(cached)return cached;
    try{const response=await fetch(new Request(event.request,{cache:'reload'}));if(response.ok&&response.type==='basic')await visited.put(key,response.clone());return response;}
    catch(error){if(event.request.mode==='navigate')return await shell.match(new URL('offline.html',BASE).href);return new Response('Offline: first visit requires a connection',{status:503,headers:{'Content-Type':'text/plain'}});}
  })());
});



