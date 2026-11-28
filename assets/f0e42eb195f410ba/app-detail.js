"use strict";
// App part 4 of 8: the place detail sheet. renderDetail gathers the place state and
// lays out one line per section; each helper below builds one section's markup, in
// the same order the sheet shows them. selectPlace opens the sheet for a place.
function detailFacts(p, h, info) {
  return `<div class="detail-facts"><div><span>${p.camp?'Camping rate':esc({entry:'Entrance',parking:'Parking',tour:'Tour',rental:'Rental'}[info?.price?.kind] || 'Cost guide')}</span><strong class="entry-price">${esc(priceLabel(p))}</strong></div><div><span>${p.camp?'Campsite type':'Time to allow'}</span><strong>${esc(p.camp?CAMP_KINDS[p.camp.kind] || 'Campsite':h.time || 'Not specified')}</strong></div></div>`;
}
function detailHeading(p, h) {
  return `<div class="detail-title-row"><div><p class="eyebrow">${esc(activityLabel(p))}</p><h2>${esc(h.name)}</h2><p class="detail-sub">${esc(h.area)}</p></div>${saveButton(p)}</div>${ratingButton(p)}<p class="detail-why">${esc(h.why)}</p>`;
}
function detailActions(p, s, official, feeUrl) {
  return `<div class="detail-actions">${p.navigationBlocked ? '' : link(C.directionsUrl(directionStops(destination(p))),p.accessMode === 'boat' ? 'Drive to departure ↗' : 'Directions ↗','primary')}${official?link(official,'Official website ↗','outline website-link'):''}${feeUrl && feeUrl!==official?link(feeUrl,'Fees & tickets ↗','outline fee-link'):''}</div>`;
}
function visitActions(p, v) {
  return `<div class="visit-actions"><button class="outline visit-toggle" data-visit="${esc(p.id)}" aria-pressed="${v.status === 'done'}">${v.status === 'done' ? '✓ Visited' : v.status === 'likely' ? 'Confirm visit' : 'Mark visited'}</button>${v.status==="done"?`<button class="outline" data-revisit="${esc(p.id)}" aria-pressed="${v.revisit===true}">${v.revisit?"Return requested":"Want to return"}</button>`:""}${link('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name+' '+p.area+' Florida'),'More photos & reviews ↗','text-button')}</div>`;
}
function visitCaption(v) {
  return v.status !== 'none' ? `<p class="visit-caption">${v.status === 'likely' ? 'Likely match for your outing · ' : 'Visited · '}${esc(visitDate(v.date))}${v.activity?' · '+esc(v.activity):''}</p>` : '';
}
function feesBody(p, info, feeUrl) {
  return `<p>${esc(info?.price?.details || p.cost)}</p>${info?.price?.checked?`<p class="private-note">Price source checked ${esc(info.price.checked)}. Recheck the official page before going.</p>`:''}${feeUrl?link(feeUrl,'Open official fees ↗','text-button'):''}`;
}
function amenitiesBody(p, info) {
  return `${visitTags(p)}${info.family?.reason?`<p>${esc(info.family.reason)}</p>`:''}${info.amenities?.length?`<p>${esc(info.amenities.map(x=>x.replaceAll('-',' ')).join(' · '))}</p>`:''}${info.family?.sourceUrl?link(info.family.sourceUrl,'Facilities source ↗','text-button'):''}`;
}
function planBody(p) {
  return `<p>${esc(p.experience)}</p><h4>Time to allow</h4><p>${esc(p.duration)}</p><h4>Access & booking</h4><p>${esc(p.access)}</p><h4>Walking & water entry</h4><p>${esc(fieldText(p.mobility))}</p>${p.repeat && !visit(p).activity && !D.initialVisits?.[p.id] ? `<h4>${(p.userVisit ?? p.visited) === true ? 'Why go back' : 'Trip fit'}</h4><p>${esc(p.repeat)}</p>` : ''}`;
}
function conditionsBody(p, report) {
  return `<p>${esc(report.summary || 'No current conditions report established.')}</p><p class="private-note">Source checked ${esc(report.checked || 'date unknown')}.${report.reportDate ? ' Report dated '+esc(report.reportDate)+'.' : ' This is not a live conditions report.'}</p>${(p.restrictions||[]).map(r=>'<p><strong>'+esc((r.activities||[]).join(', ')+' · '+r.status)+'</strong><br>'+esc(r.summary)+'<br>'+esc(r.reportDate?'Reported '+r.reportDate:'Report date unknown')+' · '+esc(r.checked?'checked '+r.checked:'Check date unknown')+' '+(r.sourceUrl?link(r.sourceUrl,'Operator source ↗'):'')+'</p>').join('')}${p.water ? `<h4>Water</h4><p>${esc(fieldText(p.water))}</p>` : ''}`;
}
function notesBody(p, s, v) {
  return `<div class="pick-row">${[['yes','Save'],['maybe','Maybe'],['no','Pass'],['','Clear']].map(([v,t])=>`<button data-pick="${v}" data-id="${esc(p.id)}" class="${s.pick===v&&v?'active':''}" aria-pressed="${s.pick===v&&!!v}">${t}</button>`).join('')}</div><div class="note-row"><label>My note<textarea id="place-note" data-id="${esc(p.id)}" placeholder="Anything you want to remember…">${esc(s.note)}</textarea></label><label>Plan a day<input id="place-day" data-id="${esc(p.id)}" type="date" value="${esc(s.day)}"></label>${v.status !== 'none' ? `<label>Visited on<input id="visit-day" data-id="${esc(p.id)}" type="date" value="${esc(v.date)}"></label><button class="text-button" data-clear-visit="${esc(p.id)}">Remove from Done</button>` : ''}</div>`;
}
function photoCreditsBody(info) {
  return `<div class="source-list">${info.photos.map(photo=>link(photo.sourceUrl,photo.credit+' · '+photo.alt,'photo-credit')).join('')}</div>`;
}
function suppliedPinsBody(p) {
  if(!p.suppliedPins?.length)return '';
  return '<h4>Saved map pins</h4><p>These source points may differ from the road entrance.</p>'+p.suppliedPins.map(pin=>'<p>'+link(pin.sourceUrl,pin.name)+' · '+esc([pin.relation,(pin.point||[]).join(', ')].filter(Boolean).join(' · '))+'</p>').join('');
}
function sourcesBody(p) {
  return `${suppliedPinsBody(p)}<div class="source-list">${(p.sources||[]).map(x=>link(x.url,x.label||'Source')).join('')}</div>${p.navigationNote?`<p>${esc(p.navigationNote)}</p>`:''}<p class="private-note">${esc(p.coordinateNote || 'Approximate place pin. Use the named destination for navigation.')}</p>`;
}
function renderDetail(p, reset = false) {
  if (!p || (globalThis.FloridaSiteData && !FloridaSiteData.hasPlace(p.id))) return;
  const open = reset ? [] : [...$('detail').querySelectorAll('details[open]')].map(x=>x.dataset.section);
  const s = pick(p.id), h = highlight(p), report = p.conditions || {}, v = visit(p);
  const fold = (key,title,html) => `<details class="disclosure" data-section="${key}"${open.includes(key)||reset&&key==='camp'?' open':''}><summary>${title}</summary><div class="disclosure-body">${html}</div></details>`;
  const official = officialSite(p), info=p.visitor, feeUrl=info?.feeUrl || info?.price?.sourceUrl || official;
  $('detail').innerHTML = `${detailHeading(p, h)}
      ${typeof outingFitText==="function" && outingFitText(p) ? "<p>"+esc(outingFitText(p))+"</p>" : ""}
      ${detailActions(p, s, official, feeUrl)}
      ${p.navigationNote?"<p>"+esc(p.navigationNote)+"</p>":""}
      ${visitActions(p, v)}
      ${visitCaption(v)}
      ${photoMarkup(p,true)}
      ${detailFacts(p, h, info)}
      ${h.attention ? `<p class="decision-note">${esc(h.attention)}</p>` : ''}
      ${p.camp ? fold('camp','Camping details',campBody(p)) : ''}
      ${p.federal ? fold('federal','Recreation.gov sites, photos & reviews',federalHeading(p)) : ''}
      ${fold('fees','Entrance, parking & extra costs',feesBody(p, info, feeUrl))}
      ${info?.family?.reason || info?.amenities?.length ? fold('amenities','Facilities & family outings',amenitiesBody(p, info)):''}
      ${fold('ratings','Ratings & reviews',ratingDetails(p))}
      ${fold('visit','Plan your visit',planBody(p))}
      ${fold('conditions','Conditions & water',conditionsBody(p, report))}
      ${fold('notes','My review & notes',reviewEditor(p)+notesBody(p, s, v))}
      ${info?.photos?.length ? fold('photos','Photos & credits',photoCreditsBody(info)) : ''}
      ${fold('sources','Sources & map details',sourcesBody(p))}
    `;
  if(p.federal)wireFederal(p);
}
let detailSelection=0;
function loadPlaceDetail(p,pan,selection,pending) {
  const content=$('detail');
  const summary=()=>detailHeading(p,highlight(p))+detailActions(p,pick(p.id),officialSite(p));
  content.innerHTML=`${summary()}<p role="status">Loading place details…</p>`;
  const stillOpen=()=>selection===detailSelection&&$('place-dialog').open;
  return pending.then(()=>{
    if(stillOpen())renderDetail(p,true);
  }).catch(()=>{
    if(!stillOpen())return;
    content.innerHTML=`${summary()}<p role="status">Place details could not load.</p><button type="button" class="outline" id="retry-place-detail">Try again</button>`;
    $('retry-place-detail').addEventListener('click',()=>selectPlace(p.id,pan),{once:true});
  });
}
function selectPlace(id, pan = true) {
  const p = byId.get(id); if (!p) return;
  const selection=++detailSelection;
  const previous=selectedId;selectedId = id;
  if(previous&&markerById.has(previous))markerById.get(previous).setIcon(placeIcon(byId.get(previous)));
  if(markerById.has(id))markerById.get(id).setIcon(placeIcon(p));
  renderExplore(false);
  const download=globalThis.FloridaSiteData?.loadPlace(p.id);
  const pending=download?loadPlaceDetail(p,pan,selection,download):renderDetail(p,true);
  if (pan && map && Number.isFinite(p.lat) && Number.isFinite(p.lng)) map.setView([p.lat,p.lng],11,{animate:false});
  if (!$('place-dialog').open) $('place-dialog').showModal();
  $('place-dialog').scrollTop = 0;
  return pending;
}
