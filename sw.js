/* Střelené kachny – offline režim.
   Hra se spouští VŽDY z nainstalované verze. Nová verze se stáhne jen,
   když hráč ve hře potvrdí „Aktualizovat“. Tento soubor není potřeba měnit. */
const CACHE='kachny-app';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  for(const f of FILES){if(!(await c.match(f))){try{const r=await fetch(f,{cache:'no-store'});if(r.ok)await c.put(f,r)}catch(x){}}}
  await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/version.json'))return;               // kontrola verze: vždy ze sítě
  if(u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
  if(u.origin!==location.origin)return;
  if(u.search)return;                                            // ?t=… = stahování nové verze
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>r||
    (e.request.mode==='navigate'?c.match('./index.html'):null)).then(r=>r||fetch(e.request).then(n=>{if(n.ok)c.put(e.request,n.clone());return n}))));
});
