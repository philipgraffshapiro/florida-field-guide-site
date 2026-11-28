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
let staysMap, stayMapPins=[], stayMapData={camps:[],quotes:[]};
const stayCenter = s => s.areaCenter || STAY_TOWNS[s.area];
globalThis.FloridaStaySearchCenter = (town, stays) => {
  const expected=town.toLowerCase();
  const row=stays.find(s=>stayCenter(s) && s.area.split(/\s*\/\s*/).some(area=>area.toLowerCase()===expected));
  return row ? stayCenter(row) : undefined;
};
function lodgingAreas(rows) {
  const grouped=new Map();
  for(const s of rows) {
    if(!stayCenter(s)?.every(Number.isFinite)) continue;
    if(!grouped.has(s.area)) grouped.set(s.area,[]);
    grouped.get(s.area).push(s);
  }
  return [...grouped].map(([area,quotes])=>{
    const count=new Set(quotes.map(s=>s.propertyId||s.id)).size;
    const [lat,lng]=stayCenter(quotes[0]);
    return {id:'stay-area-'+area.toLowerCase().replace(/[^a-z]+/g,'-'),name:`${area} · ${count} ${count===1?'property':'properties'} · approximate area`,area,lat,lng,stayArea:true,categories:['stay'],count,quotes};
  });
}
function rentalRows() {
  const f=filters(), q=f.query.toLowerCase().trim();
  if(f.category!=='all'||f.familyFriendly||f.freeEntry||f.amenity) return [];
  return D.stays.filter(s=>s.type!=='campsite' && (f.region==='all'||C.regionFor(s)===f.region) && (!q||[s.name,s.area,s.why].join(' ').toLowerCase().includes(q)) && (!f.maxMiles || stayCenter(s) && C.distanceMiles(f.base,stayCenter(s))<=f.maxMiles));
}
function openStayArea(area) {
  const fromStays=activeTab==='stays';
  showTab('stays');
  if(!fromStays) $('reset-stay-filters').click();
  $('stay-town').value=area;
  $('stay-town').dispatchEvent(new Event('stay-area-picked'));
  $('stay-results').scrollIntoView({block:'start',behavior:'smooth'});
}
function addLodgingPin(target,p,mapInstance=tripMap) {
  const marker=L.marker([p.lat,p.lng],{title:p.name,icon:placeIcon(p,String(p.count)),placeKind:'stay',stayArea:p.area});
  marker.bindTooltip(esc(p.name));marker.on('click',()=>{if(!nearbyMapAction(marker,mapInstance))openStayArea(p.area);});
  target.addLayer(marker);
  return marker;
}
function exploreStayAreas() {
  return enabledMapTypes.has('stay') ? lodgingAreas(rentalRows()) : [];
}
function loadRentalExplore(site) {
  $('cards').innerHTML='<p class="empty">Loading rooms and rentals…</p>';
  const stillSelected=()=>enabledMapTypes.size===1 && enabledMapTypes.has('stay');
  site.loadPanels().then(()=>{if(stillSelected()) renderExplore(false);}).catch(()=>{
    if(!stillSelected()) return;
    $('cards').innerHTML='<div class="empty"><p>Rooms and rentals could not load.</p><button class="outline" id="retry-rentals">Try again</button></div>';
    $('retry-rentals').addEventListener('click',()=>loadRentalExplore(site));
  });
}
function renderRentalExplore() {
  const site=globalThis.FloridaSiteData;
  if(site && !site.panelsReady) {
    $('show-more-places').hidden=true;
    loadRentalExplore(site);
    return;
  }
  const rows=rentalRows(), count=new Set(rows.map(s=>s.propertyId||s.id)).size;
  $('result-count').textContent=count;
  $('list-heading').textContent='Rooms & rentals';
  $('list-caption').textContent='properties · historical quotes';
  $('cards').innerHTML=rows.length?rows.slice(0,listLimit).map(s=>globalThis.floridaStayCard(s,esc,link,stayCardsApi())).join(''):'<div class="empty">No matching rentals. Clear filters or try another area.</div>';
  $('show-more-places').hidden=rows.length<=listLimit;
  $('show-more-places').textContent=`Show more quotes · ${Math.max(0,rows.length-listLimit)} left`;
  $('map-peek').innerHTML='<h2>Rooms & rentals by area</h2><p>Bed markers show approximate towns or areas. Tap a marker to compare archived quotes. Check the booking site for current prices and dates.</p>';
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
    addLodgingPin(pointsLayer,p,staysMap);
    stayMapPins.push({id:p.id,lat:p.lat,lng:p.lng,kind:'stay',approximate:true});
  }
  pointsLayer.flush();
  if(stayMapPins.length) staysMap.fitBounds(L.latLngBounds(stayMapPins.map(p=>[p.lat,p.lng])).pad(.15),{maxZoom:10});
  else staysMap.setView([28.6,-82],6);

}
