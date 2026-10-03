// Gemeinsam genutzt von index.html und sw.js
const lk=l=>l.sub+'|'+l.s;
const sod=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const nextOf=(L,l)=>L.filter(x=>x.sub===l.sub&&x.s>l.s).sort((a,b)=>a.s-b.s)[0];
const fmt=s=>new Date(s).toLocaleString('de-AT',{weekday:'short',day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'});
const rel=s=>{const n=Math.round((sod(s)-sod(Date.now()))/864e5);return n<=0?'heute':n==1?'morgen':'in '+n+' Tagen'};

// Erinnerung: 2 Tage und 1 Tag vor der nächsten Stunde des Fachs, jeweils ab 17:00
async function notifyDue(L,N,reg){
  let changed=false,now=Date.now();
  for(const l of L){
    const n=N[lk(l)];if(!n||!n.hw||n.done)continue;
    const nx=nextOf(L,l);if(!nx||now>=nx.s)continue;
    const passed=[2,1].filter(d=>{const t=new Date(nx.s);t.setDate(t.getDate()-d);t.setHours(17,0,0,0);return now>=t.getTime()});
    if(!passed.some(d=>!(n.sent||[]).includes(d)))continue;
    n.sent=[...new Set([...(n.sent||[]),...passed])];changed=true;
    await reg.showNotification(l.sub+': Hausübung '+rel(nx.s),{body:n.hw+'\nNächste Stunde: '+fmt(nx.s),tag:lk(l),icon:'icon.svg'});
  }
  return changed;
}

const idbOpen=()=>new Promise((ok,no)=>{const q=indexedDB.open('stundenplan',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>ok(q.result);q.onerror=no});
const idbGet=async()=>{const d=await idbOpen();return new Promise(r=>{const q=d.transaction('k').objectStore('k').get('s');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})};
const idbPut=async v=>{const d=await idbOpen();d.transaction('k','readwrite').objectStore('k').put(v,'s')};
