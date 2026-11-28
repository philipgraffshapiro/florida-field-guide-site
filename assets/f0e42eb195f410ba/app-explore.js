"use strict";
// App part 3 of 8: the Explore view. Reads the filter controls, sorts the matching
// places, renders the card list, the map peek panel and the filter status.
// The map shows every match; the list shows the matches inside the map area once
// the map is zoomed in (see app-location.js), like a trail app's "this area" list.
function renderPeek() {
  const p = visible.find(p => p.id === selectedId) || listed[0] || visible[0];
  if (!p) { $('map-peek').innerHTML = '<p>No places match. Try fewer filters.</p>'; return; }
  const h = highlight(p);
  const photo=p.visitor?.photos?.[0];
  $('map-peek').innerHTML = `<div class="peek-top">${photo?`<button class="peek-photo" data-open="${esc(p.id)}" aria-label="Open ${esc(h.name)}"><img class="place-photo" src="${esc(safeUrl(photo.url))}" alt="${esc(photo.alt)}" loading="lazy" referrerpolicy="no-referrer"></button>`:''}<div><p class="eyebrow">${esc(h.area)}${distanceText(p)?` · ${esc(distanceText(p))}`:''}</p><h2>${placeName(p)}</h2><p class="peek-price">${esc(priceLabel(p))}</p></div></div>${ratingButton(p)}<p class="peek-reason${h.attention ? ' peek-alert' : ''}">${esc(h.attention || h.why)}</p><div class="action-row"><button class="primary" data-open="${esc(p.id)}">Details →</button>${p.navigationBlocked ? link(officialSite(p) || p.sources[0].url,'Website ↗','outline') : link(C.directionsUrl(directionStops(destination(p))),p.accessMode === 'boat' ? 'Departure ↗' : 'Directions ↗','outline')}</div>`;
  $('map-peek').querySelector('.peek-top').insertAdjacentHTML('beforeend',saveButton(p));
}
function filters() {
  return { query: $('search').value, category:$('activity').value, date:$('outing-date')?.value || today(), mapTypes:[...enabledMapTypes], region: $('region').value, hideClosed: $('hide-closed').checked, hideVisited: $('hide-visited').checked, familyFriendly: $('family-friendly').checked, freeEntry: $('free-entry').checked, campCost: campCostChoice(), campStyle:$('camp-style').value, amenity: $('amenity').value, maxMiles: Number($('radius').value), base: basePoint() };
}
function outingContext(){
  const date=$('outing-date')?.value || today();
  return {date,category:$('activity').value,weather:$('outing-conditions')?.value || 'any',
    window:$('outing-window')?.value || 'any',arrival:$('outing-arrival')?.value || '',base:basePoint(),
    route:D.outingPlan?.routes?.[date],plan:D.outingPlan};
}
function outingFitText(p){return C.fitExplanation(p,outingContext(),picks);}
document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-revisit]');
  if(!button)return;
  const p=byId.get(button.dataset.revisit),v=p&&visit(p);
  if(!p||v.status!=='done')return;
  const newVisit={...v,revisit:!v.revisit,updated:Date.now()};
  if(newVisit.revisit)delete newVisit.revisitActivities;
  picks[p.id]={...pick(p.id),visit:newVisit};
  const saved=persist();
  renderExplore(false);renderDetail(p);renderSaved();
  toast(saved.ok?(v.revisit?'Removed from requested revisits.':'Added to requested revisits.'):'Kept in this session. Export a backup before leaving.');
});
for(const id of ['outing-conditions','outing-window','outing-date','outing-arrival']) {
  $(id)?.addEventListener('change',()=>{listLimit=12;$('sort').value='fit';renderExplore(false);});
}
function sortPlaces(places) {
  const sort=$('sort').value,origin=basePoint();
  const miles=p=>C.distanceMiles(origin,[p.lat,p.lng]) ?? Infinity;
  const ctx=outingContext(), ranks=sort==='fit'?new Map(places.map(p=>[p.id,C.fitRow(p,ctx,picks).rank])):null;
  return places.sort((a,b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'distance') return (miles(a) - miles(b)) || a.name.localeCompare(b.name);
    return C.compareFitRows(ranks.get(a.id),ranks.get(b.id)) || a.name.localeCompare(b.name);
  });
}
// A typed search finds matches anywhere in Florida; browsing lists the map area.
const listArea = () => $('search').value.trim() ? null : mapArea;
const inArea = (area,p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && area.contains([p.lat,p.lng]);
function listCaption() {
  const sort=$('sort').value;
  if (sort === 'name') return 'A to Z';
  if (sort === 'fit') return 'Best fit · alternatives follow';
  if (!basePoint()) return 'Choose a starting area or allow location';
  return $('base').value === 'me' && userLocation ? 'closest to you' : 'closest to '+$('base').selectedOptions[0].text;
}
function emptyList(area) {
  if (visible.length && area) return '<div class="empty"><h3>Nothing in this map area.</h3><p>Zoom out or move the map.</p><button class="text-button" data-all-florida>Show all of Florida</button></div>';
  return '<div class="empty"><h3>No matching places.</h3><p>Try another region or fewer filters.</p><button class="text-button" data-reset>Clear filters</button></div>';
}
function renderList(filtered) {
  const area = listArea();
  listed = area ? visible.filter(p => inArea(area,p)) : visible;
  $('result-count').textContent = listed.length;
  $('cards').innerHTML = listed.length ? listed.slice(0,listLimit).map(p => card(p)).join('') : emptyList(area);
  $('list-caption').textContent = listCaption();
  $('list-sort').value = $('sort').value;
  $('list-all-florida').hidden = !area;
  $('show-more-places').hidden = listed.length <= listLimit;
  $('show-more-places').textContent = 'Show more places · '+Math.max(0,listed.length-listLimit)+' left';
  $('list-heading').textContent = area ? 'In this map area' : filtered ? 'Your results' : 'Explore Florida';
}
function renderExplore(fit = false) {
  syncCampCost();
  syncPlannerFilters();
  visible = sortPlaces(C.filterPlaces(D.places, filters(), picks));
  const filtered = $('search').value || enabledMapTypes.size!==mapTypeOptions.length || $('activity').value!=='all' || $('region').value !== 'all' || $('radius').value !== '0' || $('hide-closed').checked || $('hide-visited').checked || $('family-friendly').checked || $('free-entry').checked || $('amenity').value || campCostChoice()!=='all';
  renderList(filtered);
  $('filter-status').hidden = !filtered;
  $('filter-status').textContent = visible.length+' matching places'+(Number($('radius').value)>0&&!basePoint()?' · Choose a starting area or use your location to apply the distance limit.':'');
  const ctx=outingContext();
  $('browse-caption').textContent=$('sort').value==='fit'?[ctx.route?.description,ctx.plan?.note,'Ranked for '+ctx.date+'. Saved dates, access, completed visits, travel distance and outing preferences affect order. Distances are straight-line estimates. Verify road time, weather and water conditions before leaving.'].filter(Boolean).join(' '):'';
  renderPeek();
  if(enabledMapTypes.size===1&&enabledMapTypes.has('stay')) renderRentalExplore();
  if (map) renderMarkers(fit);
}
