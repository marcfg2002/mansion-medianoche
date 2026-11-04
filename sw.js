const CACHE='mansion-v3';
const CORE=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const save=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  // la página: primero internet (versión nueva), si no hay conexión la copia guardada
  if(req.mode==='navigate'){
    e.respondWith(Promise.race([fetch(req).then(r=>save(req,r)),new Promise((_,rej)=>setTimeout(rej,3500))])
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
    return;
  }
  // resto (iconos, fuentes): copia guardada al momento y se actualiza por detrás
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(r=>save(req,r)).catch(()=>hit);
    return hit||net;
  }));
});
