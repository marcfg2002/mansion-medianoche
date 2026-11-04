const CACHE='mansion-v5';
const CORE=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'reload'}).then(r=>c.put(u,r))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const save=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const isPage=req.mode==='navigate'||(url.origin===location.origin&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html')));
  if(isPage){
    // página: siempre la versión más nueva si hay internet; si no, la copia guardada
    e.respondWith(Promise.race([fetch(req,{cache:'no-store'}).then(r=>save(req,r)),new Promise((_,rej)=>setTimeout(rej,4000))])
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(r=>save(req,r)).catch(()=>hit);
    return hit||net;
  }));
});
