"use strict";
// Icons and colors identify place types on every map; numbers identify clusters.
const PIN_TYPES = {
  spring: ['Spring','#46d5e7','M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z'],
  camp: ['Camping','#ffc45e','m2 20 10-17 10 17H2Zm5 0 5-9 5 9M12 3v8'],
  work: ['Work spot','#c3a1ff','M4 4h16v12H4ZM2 20h20M9 16v4m6-4v4'],
  stay: ['Room / rental area','#ff9bb7','M3 21V7m18 14V7M3 16h18M3 10h18v6H3ZM6 6h5v4H6Zm7 0h5v4h-5Z'],
  beach: ['Beach','#f6db78','M2 12a10 10 0 0 1 20 0H2Zm10-10v20M8 22h8M6 12C6 6 9 2 12 2c3 0 6 4 6 10'],
  wildlife: ['Wildlife','#9bde87','M20 3C5 2 1 12 6 18s17 0 14-15ZM4 22 17 8'],
  paddle: ['Paddling','#72b6ff','m2 14 4 6h12l4-6H2ZM7 14 16 3m-2 0 4 3'],
  swim: ['Swimming','#63ccfa','M2 17q3-3 6 0t6 0t8 0M2 21q3-3 6 0t6 0t8 0M6 13l5-6 5 5m-5-5L7 3m11 3a2 2 0 1 0 0 .1'],
  snorkel: ['Snorkeling','#84e7d8','M3 8h16v8H3ZM11 8v8m8-3h3V2h-4'],
  dive: ['Diving','#93bdf8','M5 22V2h15v12H5m0-12 15 12'],
  boardwalk: ['Boardwalk','#b4d48d','M3 4v17m18-17v17M3 8h18M3 16h18M8 8v8m8-8v8'],
  hike: ['Trail','#e0b68b','m2 21 8-17 5 10 3-5 4 12H2ZM7 10l3 2 3-2'],
  cave: ['Cave','#b9bfd0','M2 21 7 3h10l5 18h-7v-7a3 3 0 0 0-6 0v7H2Z'],
  aquarium: ['Aquarium','#81d5e8','M3 12c4-8 10-8 15 0-5 8-11 8-15 0Zm15 0 4-5v10l-4-5ZM8 10v1'],
  range: ['Range','#f6aa80','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 10v4m-2-2h4'],
  adventure: ['Adventure','#ffa191','m14 2-11 12h8l-1 8 11-13h-8l1-7Z']
};
const pinKind = p => PIN_TYPES[C.mapKind(p)] ? C.mapKind(p) : 'adventure';
function pinGlyph(kind) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PIN_TYPES[kind][2]}"/></svg>`;
}
function placeIcon(p, badge='') {
  const kind=pinKind(p), selected=p.id===selectedId;
  return L.divIcon({className:'typed-marker',html:`<div class="type-pin${selected?' selected':''}" data-kind="${kind}" style="--pin:${PIN_TYPES[kind][1]}">${pinGlyph(kind)}${badge?`<b class="pin-number">${esc(badge)}</b>`:''}${pick(p.id).pick==='yes'?'<span class="pin-saved">♥</span>':''}</div>`,iconSize:[44,44],iconAnchor:[22,22]});
}
function clusterIcon(cluster) {
  const kind=cluster.getAllChildMarkers()[0].options.placeKind||'adventure',count=cluster.getChildCount();
  const label=`${PIN_TYPES[kind][0]}: ${count}. Tap to zoom in.`;
  return L.divIcon({className:'typed-marker category-cluster',html:`<div class="type-cluster" data-kind="${kind}" title="${esc(label)}" aria-label="${esc(label)}">${pinGlyph(kind)}<b>${count}</b></div>`,iconSize:[44,44],iconAnchor:[22,22]});
}
function mapLegend(target, kinds) {
  target.innerHTML=[...new Set(kinds)].map(kind=>`<span class="legend-type" style="--pin:${PIN_TYPES[kind][1]}">${pinGlyph(kind)}${esc(PIN_TYPES[kind][0])}</span>`).join('');
}
function observeMapSize(target) {
  const observer=new ResizeObserver(()=>{
    if(target.getContainer().clientWidth && target.getContainer().clientHeight) target.invalidateSize({pan:false});
  });
  observer.observe(target.getContainer());
  target.on('unload',()=>observer.disconnect());
}
