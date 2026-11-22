"use strict";
// Town reference points from ArcGIS, checked November 16, 2026. These are NOT
// property addresses. Melrose uses its 32666 postal area to avoid the Miami namesake.
const STAY_TOWNS={
  'Ocala':[29.189311,-82.137789],'Gainesville':[29.6519756,-82.3250209],
  'Melrose':[29.718546,-82.0102741],'Hawthorne':[29.590745,-82.08471],
  'Reddick':[29.366903,-82.197501],'Hernando':[28.899974,-82.377085],
  'Spring Hill':[28.476924,-82.538748],'Webster':[28.611371,-82.049567],
  'Inglis':[29.027495,-82.66779],'Brandon':[27.937659,-82.288477],
  'Tampa':[27.947423,-82.458776],'Kissimmee':[28.294695,-81.4025342],
  'Orlando':[28.538331,-81.378879],'Ocala / Silver Springs':[29.222922,-82.062008],
  'Apopka':[28.677975,-81.511499],'Plant City':[27.998304,-82.12042],
  'Citra':[29.41176,-82.11412]
};
let staysMap, stayMapPins=[], stayMapData={camps:[],quotes:[]}, lodgingLayer;
function lodgingAreas(rows) {
  const grouped=new Map();
  for(const s of rows) {
    if(!STAY_TOWNS[s.area]) continue;
    if(!grouped.has(s.area)) grouped.set(s.area,[]);
    grouped.get(s.area).push(s);
  }
  return [...grouped].map(([area,quotes])=>{
    const count=new Set(quotes.map(s=>s.propertyId||s.id)).size;
    return {id:'stay-area-'+area.toLowerCase().replace(/[^a-z]+/g,'-'),name:`${area} · ${count} properties · approximate area`,area,lat:STAY_TOWNS[area][0],lng:STAY_TOWNS[area][1],stayArea:true,categories:['stay'],count,quotes};
  });
}
function rentalRows() {
  const f=filters(), q=f.query.toLowerCase().trim();
  if(f.category!=='all'||f.familyFriendly||f.freeEntry||f.amenity) return [];
  return D.stays.filter(s=>s.type!=='campsite' && (f.region==='all'||s.region===f.region) && (!q||[s.name,s.area,s.why].join(' ').toLowerCase().includes(q)) && (!f.maxMiles || STAY_TOWNS[s.area] && C.distanceMiles(f.base,STAY_TOWNS[s.area])<=f.maxMiles));
}
function openStayArea(area) {
  showTab('stays');
  for(const id of ['stay-kind','stay-region','stay-camp-cost','stay-window']) $(id).value='all';
  for(const id of ['stay-showers','stay-power']) $(id).checked=false;
  $('stay-budget').value='';$('stay-min-budget').value='';
  $('stay-city').value=area;
  $('stay-city').dispatchEvent(new Event('change'));
  $('stay-results').scrollIntoView({block:'start',behavior:'smooth'});
}
function addLodgingPin(target,p) {
  const marker=L.marker([p.lat,p.lng],{title:p.name,icon:placeIcon(p,String(p.count)),placeKind:'stay',stayArea:p.area});
  marker.bindTooltip(esc(p.name));marker.on('click',()=>{if(!nearbyMapAction(marker,staysMap))openStayArea(p.area);});
  target.addLayer(marker);
  return marker;
}
function exploreStayAreas() {
  return enabledMapTypes.has('stay') ? lodgingAreas(rentalRows()) : [];
}
function renderRentalExplore() {
  const rows=rentalRows(), count=new Set(rows.map(s=>s.propertyId||s.id)).size;
  $('result-count').textContent=count;
  $('list-heading').textContent='Rooms & rentals';
  $('list-caption').textContent='properties · historical quotes';
  $('cards').innerHTML=rows.length?rows.slice(0,listLimit).map(s=>globalThis.floridaStayCard(s,esc,link,stayCardsApi())).join(''):'<div class="empty">No matching rentals. Clear filters or try another area.</div>';
  $('show-more-places').hidden=rows.length<=listLimit;
  $('show-more-places').textContent=`Show more quotes · ${Math.max(0,rows.length-listLimit)} left`;
  $('map-peek').innerHTML='<h2>Rooms & rentals by area</h2><p>Pink bed markers show towns, not exact properties. Tap an area to compare its listings. Prices are historical; check your dates on the listing.</p>';
}
function drawStaysMap(camps,quotes) {
  if(camps) stayMapData={camps,quotes};
  if(activeTab!=='stays'||!$('stays-map')||!window.L) return;
  if(!staysMap){
    staysMap=L.map('stays-map',{scrollWheelZoom:true,fadeAnimation:false,zoomAnimation:false,minZoom:5});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(staysMap);
    staysMap.pointsLayer=typedClusterLayer(staysMap);observeMapSize(staysMap);
  }
  applyTheme();staysMap.invalidateSize({pan:false});
  stayMapPins=[];
  const pointsLayer=staysMap.pointsLayer;pointsLayer.clearLayers();
  for(const p of stayMapData.camps) {
    if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))continue;
    const marker=L.marker([p.lat,p.lng],{title:p.name,icon:placeIcon(p),placeKind:pinKind(p),placeId:p.id});
    pointsLayer.addLayer(marker);
    marker.bindTooltip(esc(p.name));marker.on('click',()=>{if(!nearbyMapAction(marker,staysMap))openPlace(p.id);});
    stayMapPins.push({id:p.id,lat:p.lat,lng:p.lng,kind:'camp',approximate:false});
  }
  for(const p of lodgingAreas(stayMapData.quotes)) {
    addLodgingPin(pointsLayer,p);
    stayMapPins.push({id:p.id,lat:p.lat,lng:p.lng,kind:'stay',approximate:true});
  }
  pointsLayer.flush();
  if(stayMapPins.length) staysMap.fitBounds(L.latLngBounds(stayMapPins.map(p=>[p.lat,p.lng])).pad(.15),{maxZoom:10});
  else staysMap.setView([28.6,-82],6);

}
