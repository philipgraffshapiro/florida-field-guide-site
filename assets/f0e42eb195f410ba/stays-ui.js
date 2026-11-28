'use strict';
{
  const root = globalThis;
  const el = id => document.getElementById(id);
  const providerPriceNote = 'The Airbnb link uses your nightly range. Compare prices on Vrbo and Hipcamp.';
  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  const dateLabel = value => value && new Date(value+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
  const campKinds = ['all','camping','primitive','no-facilities'];
  const names = {'private-room':'Private room','entire-place':'Entire place','furnished-rv':'Furnished camper','tiny-home':'Tiny home',campsite:'Campsite',lodging:'Lodging'};
  const labels = {
    'dated-listing-quote':'Archived quote',
    'published-rate-calculation-not-availability-quote':'Published-rate estimate',
    'unavailable-no-dated-quote':'Unavailable when checked',
    'unknown-no-dated-quote':'No price captured',
    'lead-undated-starting-price':'Undated listing lead',
  };
  function readStayFilters() {
    const showCamping=campKinds.includes(el('stay-kind').value);
    el('stay-camp-cost').disabled=!showCamping;
    for(const id of ['stay-showers','stay-power']) {
      el(id).disabled=!showCamping;
      if(!showCamping) el(id).checked=false;
    }
    if(!showCamping) el('stay-camp-cost').value='all';
    return root.FloridaStayForm.read();
  }
  function campMatches(p,f) {
    const c=p.camp,night=c?.free===true?0:c?.nightly;
    return c && campKinds.includes(f.kind) && !f.checkIn && !f.guests &&
      (!['primitive','no-facilities'].includes(f.kind)||root.FloridaCore.campStyleMatches(c,f.kind)) &&
      (f.region==='all'||root.FloridaCore.regionFor(p)===f.region) && root.FloridaStays.budgetMatches(night,f) &&
      root.FloridaStays.townMatches(p,f.town) && (f.cost==='all'||c.free===(f.cost==='free')) &&
      (!f.showers||c.showers===true) && (!f.power||c.power===true);
  }
  function stayPhoto(s,esc,link) {
    const photo=s.photos?.[0];
    if (!photo) return '<p class="photo-status">No verified photo in the guide.</p>';
    return `<figure class="detail-photo"><a href="${esc(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open listing gallery for ${esc(s.name)}"><img class="place-photo" src="${esc(photo.url)}" alt="${esc(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="photo-empty">Photo unavailable on this connection</span></a><figcaption>${esc(photo.alt)} · ${link(photo.sourceUrl,photo.credit)}</figcaption></figure>`;
  }
  function cardPrice(s,esc) {
    const hasPrice=Number.isFinite(s.nightly), isQuote=s.priceStatus==='dated-listing-quote';
    const dated=s.dates?.checkIn && s.dates?.checkOut && s.priceStatus!=='lead-undated-starting-price';
    const scope=dated ? `${dateLabel(s.dates.checkIn)} to ${dateLabel(s.dates.checkOut)} · ${s.guests ? `${s.guests} adult${s.guests===1?'':'s'}`:'Guest count unverified'}` : '';
    const summary=[hasPrice ? `${money(s.total)} for ${s.nights} night${s.nights===1?'':'s'}` : '',scope,s.checked ? `Checked ${dateLabel(s.checked)}` : ''].filter(Boolean).join(' · ');
    const fees=hasPrice&&isQuote ? ` · ${s.taxesIncluded===true ? 'fees and taxes included' : s.feesIncluded===true ? 'fees included, taxes unverified' : 'fees and taxes unverified'}` : '';
    return `<p class="stay-meta">${esc(labels[s.priceStatus]||'Saved stay')}</p>${hasPrice?`<p class="stay-price">${money(s.nightly)} <small>/ night average</small></p>`:''}<p class="nightly">${esc(summary+fees)}</p>`;
  }
  function feeDetails(s) {
    const b=s.feeBreakdown;
    if(b?.checkoutTotal===s.total && Number.isFinite(b?.checkoutTotal)) {
      const known=[Number.isFinite(b.beforeTax)?`${money(b.beforeTax)} before tax`:'',Number.isFinite(b.taxes)?`${money(b.taxes)} taxes`:''].filter(Boolean);
      return [...known,`${money(b.checkoutTotal)} at checkout when checked`].join(' · ')+'.';
    }
    return s.fees || (Number.isFinite(s.total) ? 'Check the provider for the total with taxes and any charges due at the property.' : 'Final price and fees require a provider check.');
  }
  function stayDisclosure(s,esc,link) {
    const c=s.conditions||{};
    const conditions=typeof c==='string'?c:[c.summary,c.cancellation,c.minimumStay,c.carSleepingPermission,c.evChargingPermission].filter(Boolean).join(' ');
    const sources=(s.sources||[]).map(x=>link(x.url,x.label||'Source')).join('');
    return `<details class="disclosure"><summary>Price, access &amp; house rules</summary><div class="disclosure-body">${s.why?`<p>${esc(s.why)}</p>`:''}<h4>Price &amp; fees</h4><p>${esc(feeDetails(s))}</p><h4>Availability</h4><p>${esc(s.availability || 'Check current availability with the operator.')}</p>${conditions?`<h4>House rules when checked</h4><p>${esc(conditions)}</p>`:''}<div class="source-list">${sources}</div></div></details>`;
  }
  function stayCard(s,esc,link,api) {
    const caveat=root.FloridaStays.caveat(s);
    const dated=s.dates?.checkIn && s.priceStatus!=='lead-undated-starting-price';
    const actions=[link(s.url,dated && s.type!=='campsite'?'Check listing for these dates':'Check with operator','primary website-link')];
    if (s.galleryUrl) actions.push(link(s.galleryUrl,'Listing gallery','outline website-link'));
    return `<article class="stay-card" data-stay="${esc(s.id)}"><div class="stay-card-top"><p class="eyebrow">${esc(names[s.type]||s.type)}</p>${api.saveButton(s)}</div><h3>${esc(s.name)}</h3><p class="card-location">${esc(s.area)}${s.type==='campsite'||s.area==='Area unverified'?'':' · approximate area'}</p>${stayPhoto(s,esc,link)}${cardPrice(s,esc)}${caveat?`<p class="stay-caveat">${esc(caveat)}</p>`:''}<div class="detail-links">${actions.join('')}</div>${stayDisclosure(s,esc,link)}</article>`;
  }
  function providerMarkup(D,f,link) {
    if (Boolean(f.checkIn)!==Boolean(f.checkOut) || f.minNight!==null&&f.maxNight!==null&&f.minNight>f.maxNight) return '';
    const town=f.town.replace(/,\s*(?:FL|Florida)$/i,'');
    const areaCenter=root.FloridaStaySearchCenter?.(town,D.stays);
    return root.FloridaStays.bookingLinks({...f,areaCenter}).map(p=>link(p.url,`Search ${p.name} ↗`,'outline')).join('');
  }
  function updateSearchLinks(D,link) {
    const f=readStayFilters(), markup=providerMarkup(D,f,link);
    el('stay-search-links').innerHTML=markup;
    el('stay-provider-price-note').hidden=!markup || f.minNight===null&&f.maxNight===null;
    el('stay-provider-price-note').textContent=providerPriceNote;
  }
  function staySummary(f,camps,records) {
    const quotes=records.filter(s=>s.priceStatus==='dated-listing-quote').length;
    if (!f.checkIn) return `${camps.length} campgrounds · ${quotes} archived quotes · ${records.length-quotes} estimates or other checks`;
    const context=[f.town||'Florida',`${dateLabel(f.checkIn)} to ${dateLabel(f.checkOut)}`,`${f.guests} adult${f.guests===1?'':'s'}`].join(' · ');
    return `${context} · ${quotes} archived quote${quotes===1?'':'s'}${records.length>quotes?`, ${records.length-quotes} other checks`:''}`;
  }
  function emptyStayResults(f) {
    if (f.checkIn) return '<div class="empty"><h3>No archived checks match this search</h3><p>Check the booking sites below for availability and the total price for your dates and guests.</p></div>';
    return '<div class="empty"><h3>No stays match these filters</h3><p>Try another area or check a booking site.</p></div>';
  }
  function renderStayResults(D,f,esc,link,limit,api) {
    const camps=D.places.filter(p=>campMatches(p,f));
    const records=f.showers||f.power||f.cost!=='all'?[]:root.FloridaStays.filter(D.stays,f);
    const mapped=records.filter(s=>s.type!=='campsite' && (!f.checkIn || s.priceStatus==='dated-listing-quote'));
    el('stay-map-column').hidden=camps.length===0 && mapped.length===0;
    api.drawStaysMap(camps,mapped);
    const rows=[...camps.map(p=>({kind:'camp',p})),...records.map(p=>({kind:'record',p}))];
    el('stay-result-count').textContent=staySummary(f,camps,records);
    el('more-stays').hidden=rows.length<=limit;
    el('more-stays').textContent=`Show more stays · ${Math.max(0,rows.length-limit)} left`;
    el('stay-results').innerHTML=rows.length?rows.slice(0,limit).map(r=>r.kind==='camp'?api.card(r.p):stayCard(r.p,esc,link,api)).join(''):emptyStayResults(f);
    el('stay-booking-options').hidden=!f.checkIn && rows.length>0;
    if (!el('stay-booking-options').hidden) el('stay-booking-options').innerHTML=`<p class="private-note">${f.minNight!==null||f.maxNight!==null?providerPriceNote:'Check current availability and prices with the booking sites.'}</p><div class="stay-search-links">${providerMarkup(D,f,link)}</div>`;
  }
  function resetStayFields() {
    for(const id of ['stay-kind','stay-region','stay-camp-cost']) el(id).value='all';
    for(const id of ['stay-budget','stay-min-budget','stay-town','stay-in','stay-out','stay-guests']) el(id).value='';
    for(const id of ['stay-showers','stay-power']) el(id).checked=false;
    el('stay-filter-error').textContent='';
  }
  root.floridaStayCard=stayCard;
  root.renderFloridaStays=function(D,esc,link,api) {
    let limit=12;
    el('stays-content').innerHTML=root.FloridaStayForm.frame(D,esc);
    let applied=readStayFilters();
    const render=()=>renderStayResults(D,applied,esc,link,limit,api);
    const apply=()=>{
      if(!root.FloridaStayForm.valid()) return false;
      applied=readStayFilters();
      limit=12;
      render();
      updateSearchLinks(D,link);
      return true;
    };
    for(const id of ['stay-region','stay-kind','stay-camp-cost','stay-showers','stay-power','stay-min-budget','stay-budget']) el(id).addEventListener('change',apply);
    for(const id of ['stay-town','stay-in','stay-out','stay-guests','stay-min-budget','stay-budget']) el(id).addEventListener('input',()=>updateSearchLinks(D,link));
    el('stay-town').addEventListener('stay-area-picked',apply);
    el('stay-filters-toggle').addEventListener('click',()=>el('stay-filters-dialog').showModal());
    el('apply-stay-filters').addEventListener('click',()=>{if(apply()) el('stay-filters-dialog').close();});
    el('reset-stay-filters').addEventListener('click',()=>{resetStayFields();apply();});
    el('more-stays').addEventListener('click',()=>{limit+=12;render();});
    api.mapLegend(el('stays-legend'),['camp','stay']);
    render();
    updateSearchLinks(D,link);
  };
}
