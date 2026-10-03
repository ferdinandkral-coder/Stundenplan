importScripts('core.js');
const C='stundenplan-v1',A=['./','index.html','core.js','manifest.webmanifest','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))));clients.claim()});
// Netzwerk zuerst (neue GitHub-Version), sonst Cache
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!='GET'||new URL(r.url).origin!=location.origin)return;
  e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(C).then(k=>k.put(r,c));return x}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))));
});
self.addEventListener('periodicsync',e=>{if(e.tag=='due')e.waitUntil((async()=>{
  const s=await idbGet();if(s&&await notifyDue(s.L,s.N,self.registration))await idbPut(s);
})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./#todo'))});
