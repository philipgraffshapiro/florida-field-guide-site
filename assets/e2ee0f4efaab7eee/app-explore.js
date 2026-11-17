"use strict";
// App part 3 of 8: the Explore view. Reads the filter controls, sorts the matching
// places, renders the card list, the map peek panel and the filter status.
function renderPeek() {
  const p = visible.find(p => p.id === selectedId) || visible[0];
  if (!p) { $('map-peek').innerHTML = '<p>No places match. Try fewer filters.</p>'; return; }
  const h = highlight(p);
  const photo=p.visitor?.photos?.[0];
  $('map-peek').innerHTML = `<div class="peek-top">${photo?`<button class="peek-photo" data-open="${esc(p.id)}" aria-label="Open ${esc(h.name)}"><img class="place-photo" src="${esc(safeUrl(photo.url))}" alt="${esc(photo.alt)}" loading="lazy" referrerpolicy="no-referrer"></button>`:''}<div><p class="eyebrow">${esc(h.area)}</p><h2>${placeName(p)}</h2><p class="peek-price">${esc(priceLabel(p))}</p></div></div>${ratingButton(p)}<p class="peek-reason${h.attention ? ' peek-alert' : ''}">${esc(h.attention || h.why)}</p><div class="action-row"><button class="primary" data-open="${esc(p.id)}">Details →</button>${p.navigationBlocked ? link(officialSite(p) || p.sources[0].url,'Website ↗','outline') : link(C.directionsUrl([$('base').selectedOptions[0].text+', Florida',destination(p)]),p.accessMode === 'boat' ? 'Departure ↗' : 'Directions ↗','outline')}</div>`;
  $('map-peek').querySelector('.peek-top').insertAdjacentHTML('beforeend',saveButton(p));
}
function filters() {
  return { query: $('search').value, category:$('activity').value, mapTypes:[...enabledMapTypes], region: $('region').value, hideClosed: $('hide-closed').checked, hideVisited: $('hide-visited').checked, familyFriendly: $('family-friendly').checked, freeEntry: $('free-entry').checked, campCost: campCostChoice(), campStyle:$('camp-style').value, amenity: $('amenity').value, maxMiles: Number($('radius').value), base: bases[$('base').value] };
}
function renderExplore(fit = false) {
  syncCampCost();
  syncPlannerFilters();
  visible = C.filterPlaces(D.places, filters(), picks).sort((a,b) => {
    if ($('sort').value === 'name') return a.name.localeCompare(b.name);
    if ($('sort').value === 'distance') return (C.distanceMiles(bases[$('base').value],[a.lat,a.lng]) ?? Infinity) - (C.distanceMiles(bases[$('base').value],[b.lat,b.lng]) ?? Infinity);
    return a.priority - b.priority || (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name);
  });
  $('result-count').textContent = visible.length;
  $('cards').innerHTML = visible.length ? visible.slice(0,listLimit).map(p => card(p)).join('') : '<div class="empty"><h3>No matching places.</h3><p>Try another region or fewer filters.</p><button class="text-button" data-reset>Clear filters</button></div>';
  $('list-caption').textContent = $('sort').value === 'fit' ? 'ranked for you' : $('sort').value === 'distance' ? 'by straight-line distance' : 'A to Z';
  $('show-more-places').hidden = visible.length <= listLimit;
  $('show-more-places').textContent = 'Show more places · '+Math.max(0,visible.length-listLimit)+' left';
  const filtered = $('search').value || enabledMapTypes.size!==mapTypeOptions.length || $('activity').value!=='all' || $('region').value !== 'all' || $('radius').value !== '0' || $('hide-closed').checked || $('hide-visited').checked || $('family-friendly').checked || $('free-entry').checked || $('amenity').value || campCostChoice()!=='all';
  $('filter-status').hidden = !filtered;
  $('filter-status').textContent = visible.length+' matching places';
  $('list-heading').textContent = filtered ? 'Your results' : 'Explore Florida';
  $('browse-caption').textContent='';
  renderPeek();
  if(enabledMapTypes.size===1&&enabledMapTypes.has('stay')) renderRentalExplore();
  if (map) renderMarkers(fit);
}
