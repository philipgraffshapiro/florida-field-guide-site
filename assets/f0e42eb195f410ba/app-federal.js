"use strict";
// Archived operator evidence for the selected listing. A facility badge cannot
// establish overnight use, equipment eligibility, an open gate or current vacancy.
const federalCache = new Map();
const federalPreviewCache=new Map();
function federalPreviews(key){
  if(!federalPreviewCache.has(key)) federalPreviewCache.set(key,readFederalDetail(key+'-photos').catch(()=>{federalPreviewCache.delete(key);return {};}));
  return federalPreviewCache.get(key);
}
function federalDate(stamp) {
  return new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'}).format(new Date(stamp))+' Eastern';
}
async function readFederalDetail(key){
  const embedded=document.getElementById('fed-'+key);
  if(embedded?.dataset.format==='json') return JSON.parse(embedded.textContent);
  let bytes;
  if(embedded) bytes=Uint8Array.from(atob(embedded.textContent),c=>c.charCodeAt(0));
  else {
    const base=globalThis.FLORIDA_ASSET_BASE || document.baseURI;
    const url=new URL('federal-details/'+encodeURIComponent(key)+'.json.gz',base);
    const res=await fetch(url,{signal:AbortSignal.timeout(16000)});
    if(!res.ok) throw new Error('Archive request failed');
    bytes=new Uint8Array(await res.arrayBuffer());
  }
  const stream=new Blob([bytes]).stream();
  // A host may transparently decompress a .gz asset before returning it.
  const response=new Response(bytes[0]===31 && bytes[1]===139?stream.pipeThrough(new DecompressionStream('gzip')):stream);
  return response.json();
}
function federalHeading(p) {
  const f=p.federal;
  const stats=[f.label,f.siteCount+' site records',f.savedPhotoCount+' saved photos of '+f.photoCount+' references',f.reviewCount+' saved reviews'].join(' · ');
  return '<p>'+esc(stats)+'</p><p>Saved '+esc(federalDate(f.checked))+'. Check the booking page for current prices, rules and openings.</p>'+
    link(f.url,'Open Recreation.gov listing ↗','outline')+'<div data-fed-content><button type="button" class="outline" data-fed-load>Browse saved evidence</button></div>';
}
function federalNight(d,s,day){
  const code=s.calendar[day.slice(0,7)]?.[Number(day.slice(8,10))-1];
  return (code && d.statuses[parseInt(code,36)]) || 'Unknown';
}
function siteClass(s){
  if(s.use!=='Overnight') return s.use==='Day'?'Day use':'Use unconfirmed';
  if(/boat|moor/i.test(s.type))return 'Boat overnight';
  if(/cabin|lodging|lookout|yurt/i.test(s.type))return 'Lodging overnight';
  if(/tent only/i.test(s.type))return 'Tent-only overnight';
  return 'Other overnight';
}
function federalPrice(price){
  if(!price || !Number.isFinite(price.min))return 'Rate unknown';
  return '$'+price.min+(price.max!==price.min && Number.isFinite(price.max)?'–$'+price.max:'')+' per '+(price.unit || 'unit unknown')+' before unconfirmed fees';
}
function bookingForNight(url,day) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return url;
  const arrival=new Date(day+'T12:00:00Z');
  arrival.setUTCDate(arrival.getUTCDate()+1);
  const target=new URL(url);
  target.searchParams.set('start_date',day);
  target.searchParams.set('end_date',arrival.toISOString().slice(0,10));
  return target.href;
}
function liveNightText(d,s,day){
  if(d.latest?.day!==day)return 'Current availability unknown.';
  const status=d.latest.byId[s.id]||'Unknown';
  return 'Provider reply '+federalDate(d.latest.checked)+': '+status+'. Confirm the site and night before booking.';
}
async function checkFederalNight(d,root,draw){
  const day=root.querySelector('[data-fed-day]').value;
  const output=root.querySelector('[data-fed-message]');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return;
  const button=root.querySelector('[data-fed-live]');
  const id=/^campground-(\d+)$/.exec(d.key)?.[1];
  if(!id)return;
  const endpoint=new URL('https://www.recreation.gov/api/camps/availability/campground/'+id+'/month');
  endpoint.searchParams.set('start_date',day.slice(0,7)+'-01T00:00:00.000Z');
  button.disabled=true;output.textContent='Checking Recreation.gov for '+day+'…';
  delete d.latest;
  try{
    const res=await fetch(endpoint,{signal:AbortSignal.timeout(8500),credentials:'omit',cache:'no-store'});
    if(!res.ok)throw new Error('Provider calendar unavailable');
    const month=(await res.json()).campsites;
    if(!month || typeof month!=='object' || Array.isArray(month))throw new Error('Calendar format unavailable');
    if(root.querySelector('[data-fed-day]').value!==day)return;
    const byId=Object.fromEntries(d.sites.map(s=>[s.id,month[s.id]?.availabilities?.[day+'T00:00:00Z']]).filter(([,v])=>typeof v==='string'));
    if(!Object.keys(byId).length)throw new Error('No individual site statuses');
    d.latest={day,byId,checked:new Date().toISOString()};
    output.textContent='Received '+Object.keys(byId).length+' individual site statuses for '+day+'. Check the selected site below.';
  }catch{
    if(root.querySelector('[data-fed-day]').value===day)output.innerHTML='Current availability could not be checked here for '+esc(day)+'. '+link(bookingForNight(d.url,day),'Open the official calendar ↗')+' and confirm your dates there.';
  }finally{button.disabled=false;draw();}
}
function federalSite(d,s,day){
  const status=federalNight(d,s,day), url=bookingForNight('https://www.recreation.gov/camping/campsites/'+s.id,day);
  const rows=Object.entries({...s.facts,...s.amenities}).map(([k,v])=>campRow(k,v)).join('');
  return '<details><summary>'+esc('Site '+s.name+' · '+s.type+' · '+status)+'</summary><p>'+esc([s.loop,s.use,federalPrice(s.price)].filter(Boolean).join(' · '))+'</p><p>Permitted equipment: '+esc(s.equipment.join(', ')||'Unknown')+'</p>'+
    '<p>'+esc(day)+' · Saved calendar: '+esc(status)+'. '+esc(liveNightText(d,s,day))+'</p><p>'+esc(s.reviewCount && Number.isFinite(s.rating)?s.rating.toFixed(1)+' / 5 from '+s.reviewCount+' saved site ratings':'No site rating in this capture')+'</p>'+
    (s.notices.length?'<p>'+esc(s.notices.join(' '))+'</p>':'')+'<dl>'+rows+'</dl>'+link(url,'Check site '+s.name+' for '+day+' ↗','outline')+'</details>';
}
function federalImage(p,d){return '<figure class="detail-photo"><a href="'+esc(safeUrl(p.url))+'" target="_blank" rel="noopener noreferrer"><img class="place-photo" style="width:100%;max-height:220px;object-fit:contain" src="'+esc(d.previews?.[p.url]?'data:image/webp;base64,'+d.previews[p.url]:safeUrl(p.url))+'" alt="'+esc(p.alt)+'" loading="lazy" referrerpolicy="no-referrer"><span class="photo-empty">Image unavailable on this connection</span></a><figcaption>'+esc(p.scene+' · '+p.alt+' · '+p.credit)+'</figcaption></figure>';}
function federalReview(r,d){return '<p><strong>'+esc([r.date,r.rating+' / 5',r.site?'Site '+(d.sites.find(s=>s.id===r.site)?.name||r.site):'Facility review'].filter(Boolean).join(' · '))+'</strong><br>'+esc([r.text,r.accessibility].filter(Boolean).join(' · ') || 'Rating only')+'</p>';}
function federalMedia(d,siteId,page){
  const selected=d.sites.find(s=>s.id===siteId);
  const available=d.photos.filter(p=>p.saved!==false);
  const own=available.filter(p=>!siteId || p.site===siteId);
  const general=!!siteId && !own.length;
  const photos=general ? available.filter(p=>!p.site) : own;
  const scope=general ? '<p>No individual photo for site '+esc(selected?.name||siteId)+' in this '+(d.compact?'inline sample':'archive')+'. '+(photos.length?'General facility views are shown below.':'No general facility view was saved here.')+'</p>' : '';
  const reviewRows=d.reviews.filter(r=>!siteId || r.site===siteId);
  const end=page*10, start=end-10;
  const images=photos.slice(start,end).map(p=>federalImage(p,d)).join('');
  const reviews=reviewRows.slice(start,end).map(r=>federalReview(r,d)).join('');
  return '<h4>Provider photos and visitor reviews</h4>'+scope+(d.compact?'<p>This inline guide includes a small sample. The full guide has the complete saved gallery and reviews.</p>':'')+
    '<p>'+photos.length+' photos · '+reviewRows.length+' reviews in this view</p>'+images+reviews+
    (Math.max(photos.length,reviewRows.length)>10?'<div><button type="button" data-fed-prev '+(page===1?'disabled':'')+'>Previous</button> Page '+page+' <button type="button" data-fed-next '+(end>=Math.max(photos.length,reviewRows.length)?'disabled':'')+'>Next</button></div>':'');
}
function federalControls(d,day){
  return (d.notices.length?'<details><summary>Operator notices ('+d.notices.length+')</summary>'+d.notices.map(n=>'<p>'+esc(n)+'</p>').join('')+'</details>':'')+
    (d.description?'<details><summary>Provider description and directions</summary><p>'+esc(d.description)+'</p><p>'+esc(d.directions||'Directions not supplied')+'</p></details>':'')+
    (d.sites.length?'<label>Night to compare<input type="date" data-fed-day value="'+esc(day)+'"></label><label>Site use<select data-fed-use><option value="">All uses</option>'+[...new Set(d.sites.map(siteClass))].map(v=>'<option>'+esc(v)+'</option>').join('')+'</select></label><label>Site number, type or equipment<input type="search" data-fed-query></label><label>Specific site<select data-fed-site><option value="">All sites</option>'+d.sites.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name+' · '+s.type)+'</option>').join('')+'</select></label><button type="button" class="outline" data-fed-live>Check this night now</button><p data-fed-message role="status"></p><div data-fed-results></div>':'<p>No per-site calendar in this listing. Check the operator for reservations or entry requirements.</p>')+
    '<div data-fed-media></div>';
}
function bindFederal(root,d){
  const day=$('stay-in')?.value || today();
  root.innerHTML=federalControls(d,day);
  let page=1;
  const draw=()=>{
    const siteId=root.querySelector('[data-fed-site]')?.value||'';
    const query=(root.querySelector('[data-fed-query]')?.value||'').trim().toLowerCase();
    const use=root.querySelector('[data-fed-use]')?.value;
    const night=root.querySelector('[data-fed-day]')?.value||day;
    const rows=d.sites.filter(s=>(!siteId||s.id===siteId)&&(!use||siteClass(s)===use)&&(!query||[s.name,'site '+s.name,s.type,s.loop,...s.equipment].join(' ').toLowerCase().includes(query)));
    const list=root.querySelector('[data-fed-results]');
    if(list)list.innerHTML='<p>'+rows.length+' matching sites. Status below was recorded '+esc(federalDate(d.checked))+'.</p>'+rows.map(s=>federalSite(d,s,night)).join('');
    root.querySelector('[data-fed-media]').innerHTML=federalMedia(d,siteId,page);
  };
  root.addEventListener('input',event=>{if(event.target.matches?.('[data-fed-day]'))root.querySelector('[data-fed-message]').textContent='';page=1;draw();});
  root.addEventListener('click',e=>{if(e.target.closest('[data-fed-live]'))checkFederalNight(d,root,draw);if(e.target.closest('[data-fed-prev]')){page--;draw();}if(e.target.closest('[data-fed-next]')){page++;draw();}});
  draw();
}
function wireFederal(p){
  if(!p.federal)return;
  const root=$('detail').querySelector('[data-fed-content]');
  if(!root)return;
  const load=async()=>{
    root.innerHTML='<p role="status">Opening saved evidence…</p>';
    const key=p.federal.key;
    try{
      if(!federalCache.has(key))federalCache.set(key,readFederalDetail(key));
      const details=await federalCache.get(key);
      if(root.isConnected){
        bindFederal(root,details);
        if(details.photos.length && !details.previews && (!details.compact || document.getElementById('fed-'+key+'-photos'))){
          const previews=await federalPreviews(key);
          details.previews=previews;
          if(root.isConnected)root.dispatchEvent(new Event('input'));
        }
      }
    }catch{
      federalCache.delete(key);
      root.innerHTML='<p>Saved details could not be loaded. Use the official listing or retry.</p><button type="button" class="outline" data-fed-load>Retry</button>';
    }
  };
  root.addEventListener('click',event=>{if(event.target.closest('[data-fed-load]'))load();});
  const fold=root.closest('details');
  fold.addEventListener('toggle',()=>{if(fold.open && root.querySelector('[data-fed-load]'))load();},{once:true});
}
