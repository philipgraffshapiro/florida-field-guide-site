"use strict";
// App part 5 of 8: the Leaflet map. Draws the visible place pins and builds the map
// with its tile layer, cluster layer, base label and the fit/style buttons.
function renderMarkers(fit) {
  const signature=visible.map(p=>p.id).join('|');
  if(signature===renderMarkers.signature&&!fit)return;
  renderMarkers.signature=signature;
  markers.clearLayers(); markerById.clear();
  const batch=[];
  for (const p of visible) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    const icon = placeIcon(p);
    const marker = L.marker([p.lat,p.lng], { icon, title: p.name, keyboard: true, placeKind:pinKind(p),placeId:p.id });
    marker.bindTooltip(esc(p.name), { direction: 'top', offset: [0,-12] });
    marker.on('click', () => {if(!nearbyMapAction(marker,map))selectPlace(p.id,false);});
    markerById.set(p.id,marker); batch.push(marker);
  }
  lodgingLayer.clearLayers();
  const areas=[];
  markers.addLayers(batch);
  mapLegend($('map-legend'),[...visible.map(pinKind),...areas.map(()=> 'stay')]);
  const points=[...visible,...areas].filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng)).map(p=>[p.lat,p.lng]);
  syncMapResults(visible.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng)),areas);
  if (fit && points.length) map.fitBounds(L.latLngBounds(points), { maxZoom: 12,paddingTopLeft:[30,50],paddingBottomRight:[30,110],animate:false });
}
// Tile layer plus the map-error notice when tiles keep failing before any loads.
function addTileLayer(url) {
  tiles = L.tileLayer(url,{maxZoom:19,subdomains:'abcd',attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'+(D.shared?'':' © <a href="https://carto.com/attributions">CARTO</a>')}).addTo(map);
  $('map').classList.toggle('shared-map-dark',!light);
  let tileErrors = 0, tileLoads = 0;
  tiles.on('tileerror',() => { if (++tileErrors > 5 && !tileLoads) $('map-error').hidden = false; });
  tiles.on('tileload',() => { tileLoads++; $('map-error').hidden = true; });
}
// Category-specific place groups and the spare overlay layers.
function addMarkerLayers() {
  markers = typedClusterLayer(map);
  socialLayer = L.layerGroup(); routeLayer = L.layerGroup().addTo(map);
  lodgingLayer = L.layerGroup().addTo(map);
}
function wireMapButtons(keyConfig, url) {
  $('fit-map').addEventListener('click',toggleExpandedMap);
  $('map-style').addEventListener('click',toggleTheme);
}
function setupMap() {
  if (!window.L) { $('map-error').hidden = false; return; }
  map = L.map('map', { zoomControl: true, scrollWheelZoom: true, fadeAnimation: false,minZoom:5,zoomAnimation:false }).setView([29.3,-82.05],8);
  const keyConfig = D.mapConfig || {};
  const url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  addTileLayer(url);
  addMarkerLayers();
  const legend=document.querySelector('.map-key');legend.id='map-legend';legend.className='map-legend';
  document.querySelector('.map-wrap').after(legend);
  renderMarkers(false);
  observeMapSize(map);
  wireMapButtons(keyConfig, url);
}
