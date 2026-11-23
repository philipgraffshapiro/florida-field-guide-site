"use strict";
// App part 2 of 8: place photos and visit tags, the save/visit actions with their
// toast and storage status, the place card and the rating button and source list.
function photoMarkup(p, detail = false) {
  const photos=p.visitor?.photos || [];
  if(detail && !photos.length) return '';
  if(detail) return `<div class="detail-media"><div class="detail-gallery" aria-label="Photographs of ${esc(p.name)}">${photos.map(photo=>`<figure class="detail-photo"><a href="${esc(safeUrl(photo.url))}" target="_blank" rel="noopener noreferrer" aria-label="Open full photo: ${esc(photo.alt)}"><img class="place-photo" src="${esc(safeUrl(photo.url))}" alt="${esc(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="photo-empty">Photo unavailable · open Photos & credits below</span></a></figure>`).join('')}</div><span class="photo-category" style="--pin:${PIN_TYPES[pinKind(p)][1]}">${esc(activityLabel(p))}</span><button class="photo-save${pick(p.id).pick==='yes'?' saved':''}" data-pick="${pick(p.id).pick==='yes'?'':'yes'}" data-id="${esc(p.id)}" aria-label="${pick(p.id).pick==='yes'?'Unsave':'Save'} ${esc(highlight(p).name)}">${pick(p.id).pick==='yes'?'♥':'♡'}</button></div>`;
  const photo=photos[0];
  return `<div class="photo-frame${photo?'':' no-photo'}"><button class="card-open photo-open" data-open="${esc(p.id)}" aria-label="Open ${esc(highlight(p).name)}">${photo?`<img class="place-photo" src="${esc(safeUrl(photo.url))}" alt="${esc(photo.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:''}<span class="photo-empty">${photo?'Photo unavailable':'Explore this place'}<small>Tap for visit details →</small></span></button><span class="photo-category" style="--pin:${PIN_TYPES[pinKind(p)][1]}">${esc(activityLabel(p))}</span><button class="photo-save${pick(p.id).pick==='yes'?' saved':''}" data-pick="${pick(p.id).pick==='yes'?'':'yes'}" data-id="${esc(p.id)}" aria-label="${pick(p.id).pick==='yes'?'Unsave':'Save'} ${esc(highlight(p).name)}">${pick(p.id).pick==='yes'?'♥':'♡'}</button></div>`;
}
function visitTags(p) {
  const tags=[...campTags(p),familyFriendly(p)?'Family friendly':'',p.accessMode==='boat'?'Boat access':'',...(p.visitor?.amenities || []).filter(x=>['playground','boardwalk','easy-walk'].includes(x)).slice(0,1).map(x=>({'playground':'Playground','boardwalk':'Boardwalk','easy-walk':'Easy walk'}[x]))].filter(Boolean);
  return tags.length?`<div class="visit-tags">${tags.slice(0,p.camp?3:2).map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:'';
}
function toast(message) { (document.querySelector('dialog[open]') || document.body).append($('toast')); $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200); }
function persist() {
  const result = storageBlocked ? { ok: false } : C.save(() => window.localStorage, picks);
  $('save-status').textContent = result.ok ? 'Your choices are saved in this browser. Export a backup to keep them.' : 'Browser storage unavailable. Export your picks before closing.';
  $('save-status').classList.toggle('save-error', !result.ok);
  const count = Object.values(picks).filter(x => ['yes','maybe'].includes(x.pick)).length;
  $('saved-badge').textContent = count || '';
  return result;
}
function updatePick(id, value) {
  picks[id] = { ...pick(id), pick: value, updated: Date.now() };
  const saved = persist(); renderSaved(); syncSaveButtons(); if (selectedId) renderDetail(byId.get(selectedId));
  const marker=markerById.get(id);if(marker&&byId.has(id))marker.setIcon(placeIcon(byId.get(id)));
  toast(!saved.ok ? 'Kept for this session only. Export your picks under More before closing.' : value ? `${value === 'yes' ? 'Saved' : value === 'maybe' ? 'Kept as a maybe' : 'Marked no'}: ${byId.get(id)?.name || id}` : 'Choice cleared');
}
// Straight-line miles from the phone, or from the chosen town when sorting by distance.
function distanceText(p) {
  const mine = $('base').value === 'me' && userLocation;
  if (!mine && $('sort').value !== 'distance') return '';
  const d = C.distanceMiles(basePoint(), [p.lat,p.lng]);
  if (d === null) return '';
  const miles = d < 10 ? d.toFixed(1) : Math.round(d);
  return mine ? `${miles} mi away` : `${miles} mi from ${$('base').selectedOptions[0].text}`;
}
function updateVisit(id, status, date) {
  const p = byId.get(id); if (!p) return;
  picks[id] = { ...pick(id), visit: { status, date: status === 'none' ? '' : date ?? (visit(p).date || today()), updated: Date.now() } };
  const saved = persist(); renderExplore(false); renderSaved(); if (selectedId) renderDetail(byId.get(selectedId));
  toast(!saved.ok ? 'Kept for this session only. Export under More before closing.' : status === 'none' ? 'Removed from Done.' : 'Visit saved. Find it in Saved → Done.');
}
function card(p, saved = false) {
  const h = highlight(p), s = pick(p.id), isSaved = s.pick === 'yes';
  return `<article class="place-card${selectedId === p.id ? ' selected' : ''}" data-place="${esc(p.id)}">
      ${saved && s.day ? `<p class="saved-date">${esc(s.day)}</p>` : ''}
      ${photoMarkup(p)}<div class="card-info"><div class="card-price-row"><strong class="entry-price">${esc(priceLabel(p))}</strong>${visit(p).status==='done'?'<span class="done-badge">✓ Done</span>':''}</div><h3 class="card-title">${placeName(p)}</h3><p class="card-location">${esc(h.area)}${distanceText(p)?` · ${esc(distanceText(p))}`:''}</p>${ratingButton(p)}${visitTags(p)}<p class="card-desc">${esc(h.why)}</p></div>
      ${h.attention ? `<p class="card-warning">${esc(h.attention)}</p>` : ''}
      <div class="card-bottom"><button class="outline" data-open="${esc(p.id)}">Visit details →</button>${p.navigationBlocked ? link(officialSite(p) || p.sources[0].url,'Access info ↗','outline') : link(C.directionsUrl(directionStops(destination(p))),p.accessMode==='boat'?'Departure ↗':'Directions ↗','outline')}${officialSite(p)?link(officialSite(p),'Official website ↗','website-link text-button'):''}</div></article>`;
}
function ratingButton(p) {
  const rating = R.summary(p.ratings);
  if (!rating) return '';
  return `<button class="rating-button" data-rating="${esc(p.id)}" aria-label="${rating.score.toFixed(1)} out of 5, ${esc(rating.label)}. View rating sources for ${esc(p.name)}"><span class="rating-stars" aria-hidden="true"><span style="width:${rating.score*20}%">★★★★★</span>★★★★★</span><strong>${rating.score.toFixed(1)}</strong><span class="rating-provider">${esc(rating.label)}</span><span aria-hidden="true">›</span></button>`;
}
function ratingDetails(p) {
  const rating = R.summary(p.ratings);
  const explanation = rating?.kind === 'blend' ? 'Equal average of the two matching listing scores, rounded to one decimal. Review counts stay separate because the audiences can overlap.' : rating?.kind === 'trail' ? 'This score is for the named trail, not the whole park or beach.' : 'The available place score is shown. A trail score, when listed below, is separate.';
  return `${rating ? `<p>${esc(explanation)}</p>` : '<p>No matching score could be verified for this place.</p>'}${['google','alltrails'].map(key=>{
    const source=p.ratings?.[key], name=key==='google'?'Google':'AllTrails';
    if(!source) return `<div class="rating-source rating-unavailable"><strong>${name}</strong><p>No verified score available.</p></div>`;
    const capture={direct:'Read from the source',indexed:'Indexed source snapshot',syndicated:'Syndicated source snapshot'}[source.capture];
    return `<div class="rating-source" data-rating-source="${key}"><div class="rating-source-heading"><strong>${name}</strong><strong class="rating-source-score">★ ${source.rating.toFixed(1)} <span>/ 5</span></strong></div><p>${esc(source.listingName)}${source.scope==='trail'?' · Trail only':''}</p><p class="rating-count">${source.reviewCount===null?'Review count unavailable':source.reviewCount.toLocaleString('en-US')+' reviews'}</p>${source.scopeNote?`<p>${esc(source.scopeNote)}</p>`:''}<p class="rating-date">${esc(capture)} · checked ${esc(source.checked)}</p><div class="rating-links">${link(source.url,'Read reviews ↗','rating-source-link')}${link(source.evidenceUrl,'Rating source ↗','rating-evidence')}</div></div>`;
  }).join('')}<p class="rating-date">Ratings are dated snapshots. Open the source for its latest score and reviews.</p>`;
}
