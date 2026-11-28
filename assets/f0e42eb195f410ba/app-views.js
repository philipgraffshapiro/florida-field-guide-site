"use strict";
// App part 6 of 8: tab switching and the other views. Filter reset, the Saved and
// Done lists, the trip and route loops, stays and practical notes, file download.
function showTab(name, view) {
  if(name==='stays'&&!$('stay-kind'))renderStays();
  if(name==='practical'&&!$('practical-content').childElementCount)renderPractical();
  activeTab = name;
  if(view){exploreView='map';setBrowseState(view==='list'?'full':'peek');}
  document.querySelectorAll('.panel').forEach(el => el.classList.toggle('active',el.id === name + '-panel'));
  $('explore-panel').classList.toggle('map-view',exploreView==='map');
  $('explore-panel').classList.toggle('list-view',exploreView==='list');
  document.querySelectorAll('.tabs [data-tab]').forEach(el => { const active=el.dataset.tab===name&&(!el.dataset.view||el.dataset.view===(browseState==='peek'?'map':'list'));el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active)); });
  $('more-button').setAttribute('aria-pressed',String(name==='practical'));
  if (name === 'explore' && map) requestAnimationFrame(() => map.invalidateSize());
  if (name === 'trip') requestAnimationFrame(drawTripMap);
  if (name === 'stays') requestAnimationFrame(()=>drawStaysMap());
  if (name === 'saved') renderSaved();
  window.scrollTo({top:0,behavior:'instant'});
}
function openPlace(id) {
  selectPlace(id,true);
}
function resetFilters(render = true) {
  listLimit = 12;
  $('outing-conditions').value = 'any'; $('outing-window').value = 'any';
  $('outing-date').value = ''; $('outing-arrival').value = '';
  $('search').value = ''; $('region').value = 'all'; $('radius').value = '0'; $('hide-closed').checked = false; $('hide-visited').checked = false; $('family-friendly').checked=false; $('free-entry').checked=false; $('amenity').value=''; $('camp-cost').value='all'; $('camp-style').value='all'; $('activity').value='all';
  enabledMapTypes=new Set(mapTypeOptions.map(([id])=>id));persistMapTypes();
  if (render) renderExplore(false);
}
function renderSaved() {
  document.querySelectorAll('[data-saved-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.savedView===savedView)));
  $('route-picks').hidden=true;
  const rows=C.filterPlaces(D.places,savedView==='done'?{visitedOnly:true}:{savedOnly:true},picks).filter(boardMatches);
  if(savedView==='done')rows.sort((a,b)=>visit(b).date.localeCompare(visit(a).date)||a.name.localeCompare(b.name));
  const lodging=savedView==='done'?[]:D.stays.filter(s=>['yes','maybe'].includes(pick(s.id).pick)&&boardMatches(s));
  const groups=new Map();
  for(const p of [...rows,...lodging]){
    const kind=p.type?'stay':pinKind(p);
    if(!groups.has(kind))groups.set(kind,[]);
    groups.get(kind).push(p);
  }
  $('saved-content').innerHTML=[...groups].map(([kind,places])=>`<section><h2 class="saved-category-heading">${esc(PIN_TYPES[kind][0])} · ${places.length}</h2><div class="saved-grid">${places.map(p=>savedView==='done'?visitedCard(p):p.type?globalThis.floridaStayCard(p,esc,link,stayCardsApi()):card(p,true)).join('')}</div></section>`).join('')||
    `<div class="empty"><h3>${savedView==='done'?'Your visited places':'Your saved places'}</h3><p>${savedView==='done'?'Open a place to add your review and visit date.':'Save a place to keep it here, grouped by category.'}</p></div>`;
}
function visitedCard(p) {
  const v=visit(p),r=ownReview(p),s=pick(p.id);
  return `<article class="place-card visited-card" data-done="${esc(p.id)}">${photoMarkup(p)}<div class="card-info"><h3>${esc(highlight(p).name)}</h3><p class="card-location">${esc(p.area)} · ${esc(visitDate(v.date))}</p>${reviewSummary(p)}${!r.text&&s.note?`<p class="legacy-note">${esc(s.note)}</p>`:''}<button class="outline" data-open="${esc(p.id)}">${r.updated?'Edit my review':'Add my review'}</button></div></article>`;
}
function stopHtml(s) {
  const p = byId.get(s.id);
  return `<li>${p ? `<button class="text-button" data-open="${esc(p.id)}">${esc(s.title || p.name)} ↗</button>` : esc(s.title)}${s.timing ? `<small>${esc(s.timing)}</small>` : ''}${s.note ? `<small>${esc(s.note)}</small>` : ''}</li>`;
}
function dayRoute(stops, origin, end) { return C.directionsUrl([origin || 'Citra, Florida',...stops.filter(s=>!s.optional).map(s => { const p = byId.get(s.id); return p ? destination(p) : s.title; }),...(end ? [end] : [])]); }
function dayTitle(day) {
  if (day.completed) return day.title;
  const main = day.stops.find(s=>!s.optional);
  return byId.has(main?.id) ? highlight(byId.get(main.id)).name : day.title;
}
function dayActions(day) {
  const route = !day.completed&&(day.stops.some(s=>!s.optional)||day.destination)?link(dayRoute(day.stops,day.origin,day.destination),'Main route ↗','primary'):'';
  const save = !day.completed&&day.stops.some(s=>byId.has(s.id))?`<button class="outline" data-save-day="${esc(day.key)}">Save this day</button>`:'';
  return `<div class="detail-links">${route}${save}</div>`;
}
// Live search links for the night: each opens the site already filtered to the area and dates.
function stayLinksHtml(day) {
  if (!day.stayLinks?.length) return '';
  return `<div class="stay-links"><p class="stay-links-label">${esc(day.stayLabel || 'Where to sleep')}</p><div class="detail-links">${day.stayLinks.map(l=>link(l.url,l.label,'outline')).join('')}</div></div>`;
}
function renderTrip() {
  renderVisualTrip();
}
function renderStays() { globalThis.renderFloridaStays(D, esc, link,stayCardsApi()); }
function renderPractical() {
  $('edition-information').textContent = `${D.shared ? 'Friends' : 'Personal'} edition · Catalog updated ${D.catalogUpdated || D.researched}. Each source keeps its own check date.`;
  if(D.shared){$('practical-content').innerHTML='<div class="section-top"><h1>About this guide.</h1><p>Florida springs, wildlife and outdoor experiences. Open a place for access details, dated conditions and source links.</p></div>';return;}
  globalThis.renderFloridaPractical(D, esc, link);
}
function download(filename, data) {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
