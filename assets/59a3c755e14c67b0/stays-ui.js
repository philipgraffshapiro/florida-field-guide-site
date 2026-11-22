'use strict';
{
  const root = globalThis;
  const money = n => Number.isFinite(n) ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n) : 'Not quoted';
  const names = {'private-room':'Private room','entire-place':'Entire place','furnished-rv':'Furnished camper','tiny-home':'Tiny home',campsite:'Campsite'};
  function syncCampingFilters() {
    const camping=['all','camping','primitive','no-facilities'].includes(document.getElementById('stay-kind').value);
    for(const id of ['stay-camp-cost','stay-showers','stay-power']) {
      const control=document.getElementById(id);
      control.disabled=!camping;
      if(!camping) {
        if(control.tagName==='SELECT') control.value='all';
        else control.checked=false;
      }
    }
  }
  function readStayFilters() { syncCampingFilters();return root.FloridaStayForm.read(); }
  function campMatches(p,f) {
    const c=p.camp,night=c?.free===true?0:c?.nightly;
    return c && ['all','camping','primitive','no-facilities'].includes(f.kind) && (!['primitive','no-facilities'].includes(f.kind)||root.FloridaCore.campStyleMatches(c,f.kind)) && f.window==='all' &&
      (f.region==='all'||root.FloridaCore.regionFor(p)===f.region) && (f.maxNight===null||Number.isFinite(night)&&night<=f.maxNight) && (f.minNight===null||Number.isFinite(night)&&night>=f.minNight) &&
      (f.cost==='all'||c.free===(f.cost==='free')) && (!f.showers||c.showers===true) && (!f.power||c.power===true);
  }
  function stayCard(s, esc, link, api) {
    const c=s.conditions||{}, caveat=root.FloridaStays.caveat(s);
    const conditions=typeof c==='string'?c:[c.summary,c.cancellation,c.minimumStay,c.carSleepingPermission,c.evChargingPermission].filter(Boolean).join(' ');
    return `<article class="stay-card" data-stay="${esc(s.id)}"><div class="stay-card-top"><p class="eyebrow">${esc(names[s.type]||s.type)}</p>${api.saveButton(s)}</div><h3>${esc(s.name)}</h3><p class="card-location">${esc(s.area)}</p><p class="stay-price">${money(s.nightly)} <small>/ night</small></p><p class="nightly">Updated ${esc(s.checked||'date unknown')} · ${money(s.total)} for ${s.nights||'?'} nights</p>${caveat?`<p class="stay-caveat">${esc(caveat)}</p>`:''}${link(s.url,'Open listing & photos','primary website-link')}<details class="disclosure"><summary>Price, access & house rules</summary><div class="disclosure-body"><p>${esc(s.why)}</p><h4>Price & fees</h4><p>${esc(s.fees||'Final fees unverified.')}</p><h4>Availability when researched</h4><p>${esc(s.availability)}</p><h4>House rules</h4><p>${esc(conditions)}</p><p class="private-note">Exact location has not been established. Open the listing for its map.</p><div class="source-list">${(s.sources||[]).map(x=>link(x.url,x.label||'Source')).join('')}</div></div></details></article>`;
  }
  function renderStayResults(D,esc,link,limit,api) {
    const f=readStayFilters(), camps=D.places.filter(p=>campMatches(p,f) && (f.city==='all'||p.area.toLowerCase().includes(f.city.toLowerCase())));
    const quotes=f.showers||f.power||f.cost!=='all'?[]:root.FloridaStays.filter(D.stays,f).filter(s=>f.city==='all'||s.area===f.city);
    api.drawStaysMap(camps,quotes);
    const rows=[...camps.map(p=>({kind:'camp',p})),...quotes.map(p=>({kind:'quote',p}))];
    document.getElementById('stay-result-count').textContent=`${camps.length} campsites · ${quotes.length} room & rental quotes`;
    document.getElementById('more-stays').hidden=rows.length<=limit;
    document.getElementById('more-stays').textContent=`Show more stays · ${Math.max(0,rows.length-limit)} left`;
    document.getElementById('stay-results').innerHTML=rows.length?rows.slice(0,limit).map(r=>r.kind==='camp'?api.card(r.p):stayCard(r.p,esc,link,api)).join(''):'<div class="empty"><h3>No matching stays</h3><p>Try fewer filters or another area.</p></div>';
  }
  function staySearch(link) {
    const el=id=>document.getElementById(id), town=el('stay-town').value.trim(), start=el('stay-in').value,end=el('stay-out').value;
    if(!town) {el('stay-search-links').innerHTML='<p class="private-note">Enter a town to search Airbnb and Hipcamp. Dates are optional.</p>';return;}
    if(start && end && end<=start) {el('stay-search-links').textContent='Check out must be after check in.';return;}
    const air=new URL('https://www.airbnb.com/s/'+encodeURIComponent(town+', Florida')+'/homes');
    const hip=new URL('https://www.hipcamp.com/en-US/search');hip.searchParams.set('q',town+', FL');
    for(const url of [air,hip]) url.searchParams.set('adults',el('stay-guests').value||'1');
    if(el('stay-budget').value)air.searchParams.set('price_max',el('stay-budget').value);
    if(el('stay-min-budget').value)air.searchParams.set('price_min',el('stay-min-budget').value);
    if(start) {air.searchParams.set('checkin',start);hip.searchParams.set('arrive',start);}
    if(end) {air.searchParams.set('checkout',end);hip.searchParams.set('depart',end);}
    el('stay-search-links').innerHTML=link(air.href,'Search Airbnb ↗','outline')+link(hip.href,'Search Hipcamp ↗','outline');
  }
  root.floridaStayCard=stayCard;
  root.renderFloridaStays=function(D,esc,link,api) {
    let limit=12;
    document.getElementById('stays-content').innerHTML=root.FloridaStayForm.frame(D,esc);
    const render=()=>renderStayResults(D,esc,link,limit,api);
    for(const id of ['stay-window','stay-region','stay-kind','stay-budget','stay-min-budget','stay-city','stay-camp-cost','stay-showers','stay-power']) document.getElementById(id).addEventListener('change',()=>{limit=12;if(root.FloridaStayForm.valid())render();staySearch(link);});
    document.getElementById('stay-filters-toggle').addEventListener('click',()=>document.getElementById('stay-filters-dialog').showModal());
    document.getElementById('apply-stay-filters').addEventListener('click',()=>{if(root.FloridaStayForm.valid()){render();document.getElementById('stay-filters-dialog').close();}});
    document.getElementById('reset-stay-filters').addEventListener('click',()=>{
      for(const id of ['stay-kind','stay-region','stay-camp-cost','stay-city'])document.getElementById(id).value='all';
      for(const id of ['stay-budget','stay-min-budget','stay-town','stay-in','stay-out'])document.getElementById(id).value='';
      for(const id of ['stay-showers','stay-power'])document.getElementById(id).checked=false;
      document.getElementById('stay-guests').value='1';render();staySearch(link);
    });
    document.getElementById('more-stays').addEventListener('click',()=>{limit+=12;render();});
    for(const id of ['stay-town','stay-in','stay-out','stay-guests']) document.getElementById(id).addEventListener('input',()=>staySearch(link));
    api.mapLegend(document.getElementById('stays-legend'),['camp','stay']);
    render();staySearch(link);
  };
}
