"use strict";
// Trip photos and pins use the same records as Explore. Lines show stop order,
// not a claimed road route; driving links keep documented entrances/departures.
function tripPlan() {
  if(branch?.startsWith('loop:') || D.shared) {
    const index = Number(branch?.split(':')[1] || 0), loop = D.loops[index] || D.loops[0];
    return {name:loop.name,summary:loop.why,days:[{...loop,key:'loop',date:loop.time,title:loop.name,summary:loop.why}]};
  }
  return D.branches.find(b=>b.id===branch) || D.branches[0];
}
function tripStop(s) {
  const p = byId.get(s.id);
  if(!p) return `<article class="trip-stop"><h3>${esc(s.title)}</h3><p>${esc(s.note || '')}</p></article>`;
  return `<article class="trip-stop" data-trip-place="${esc(p.id)}">${photoMarkup(p)}<div class="trip-stop-info"><small>${esc(s.timing || activityLabel(p))}</small><button class="trip-stop-title" data-open="${esc(p.id)}">${esc(highlight(p).name)}</button><p>${esc(highlight(p).area)}</p><strong>${esc(priceLabel(p))}</strong>${s.note?`<p class="stop-note">${esc(s.note)}</p>`:''}</div></article>`;
}
function visualDay(day, index) {
  const primary = day.stops.filter(s=>!s.optional), options = day.stops.filter(s=>s.optional);
  return `<article class="trip-day" id="trip-day-${index}" data-trip-day="${index}"><header class="trip-day-heading"><span class="day-number">${index+1}</span><div><p class="eyebrow">${esc(day.date || 'Flexible day')}</p><h2>${esc(day.title || dayTitle(day))}</h2></div><button class="text-button" data-focus-day="${index}" aria-label="Show day ${index+1} on map">⌖ Map</button></header><p class="day-summary">${esc(day.summary || '')}</p><div class="trip-stops">${primary.map(tripStop).join('')}</div>${options.length?`<details class="disclosure"><summary>${options.length} optional stops</summary><div class="disclosure-body trip-stops">${options.map(tripStop).join('')}</div></details>`:''}${day.fallback?`<details class="disclosure"><summary>Sleep & backup plan</summary><div class="disclosure-body"><p>${esc(day.fallback)}</p></div></details>`:''}${stayLinksHtml(day)}${dayActions(day)}</article>`;
}
function tripControls(plan) {
  const branches = D.branches.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
  const loops = D.loops.map((b,i)=>`<option value="loop:${i}">${esc(b.name)}</option>`).join('');
  return `<div class="trip-filters"><label>Trip idea<select id="trip-branch">${branches}<optgroup label="Regional loops">${loops}</optgroup></select></label><label>Show days<select id="trip-day-filter"><option value="all">Whole trip · ${plan.days.length} days</option>${plan.days.map((d,i)=>`<option value="${i}">Day ${i+1} · ${esc(d.date || d.title)}</option>`).join('')}</select></label></div>`;
}
function renderVisualTrip() {
  if(tripMap) { tripMap.remove(); tripMap=null; }
  const plan = tripPlan();
  if(!plan) return;
  $('trip-content').innerHTML = `<div class="section-top"><p class="eyebrow">${D.shared?'Explore by area':'Your next Florida trip'}</p><h1>${D.shared?'Pick a route.':'See the trip before you commit.'}</h1><p>${D.shared?'Places, photos and their positions on the map.':'A flexible idea. Save the stops you like; nothing here is booked.'}</p></div>${tripControls(plan)}<div class="trip-layout"><aside class="trip-map-column"><div id="trip-map" aria-label="Trip stops on a geographic map"></div><p class="map-caption"><span class="legend-line"></span> Numbered stops · Lines show visit order, not roads</p><div class="trip-nearby"><strong>Near these stops · within 35 miles</strong><label class="check-label"><input id="trip-camps" type="checkbox" ${tripExtras.camp?'checked':''}> Camping <i class="legend-camp"></i></label><label class="check-label"><input id="trip-work" type="checkbox" ${tripExtras.work?'checked':''}> Work spots <i class="legend-work"></i></label><label class="check-label"><input id="trip-stays" type="checkbox" ${tripExtras.stay?'checked':''}> Rooms & rentals <i class="legend-stay"></i></label><div id="trip-legend" class="map-legend"></div><p id="trip-map-status" class="private-note"></p></div></aside><div class="timeline">${plan.days.map(visualDay).join('')}</div></div><details class="disclosure"><summary>Draft assumptions & dated research</summary><div class="disclosure-body"><p>${esc(D.tripReminder || plan.summary)}</p><p>${esc(plan.summary || '')}</p>${D.court?`<p>${esc(D.court.summary)}</p>`:''}</div></details>`;
  $('trip-branch').value = D.shared && !branch ? 'loop:0' : branch;
  $('trip-day-filter').value = tripDay;
  $('trip-branch').addEventListener('change',()=>{branch=$('trip-branch').value;tripDay='all';renderTrip();drawTripMap();});
  $('trip-day-filter').addEventListener('change',()=>{tripDay=$('trip-day-filter').value;filterTripDays();drawTripMap();});
  for(const [id,key] of [['trip-camps','camp'],['trip-work','work'],['trip-stays','stay']]) $(id).addEventListener('change',()=>{tripExtras[key]=$(id).checked;drawTripMap();});
  mapLegend($('trip-legend'),['spring','camp','work','stay']);
  filterTripDays();
}
function filterTripDays() {
  document.querySelectorAll('[data-trip-day]').forEach(el=>el.hidden=tripDay!=='all' && el.dataset.tripDay!==tripDay);
}
function tripMarker(layer, p, label, index) {
  const marker = L.marker([p.lat,p.lng],{title:p.name,icon:placeIcon(p,index===undefined?'':'D'+label),placeKind:pinKind(p)});
  layer.addLayer(marker);
  marker.bindTooltip(esc(p.name));
  marker.on('click',()=>{
    if(index!==undefined) {
      tripDay=String(index);$('trip-day-filter').value=tripDay;filterTripDays();
      $('trip-day-'+index)?.scrollIntoView({block:'start',behavior:'smooth'});
    } else openPlace(p.id);
  });
}
function addTripNearby(layer,points) {
  const shown=[];
  for(const p of D.places) {
    const key=p.camp?'camp':p.categories.includes('work')?'work':'';
    if(!key || !tripExtras[key] || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    if(!points.some(point=>(C.distanceMiles(point,[p.lat,p.lng]) ?? Infinity)<=35)) continue;
    tripMarker(layer,p,'');shown.push(p);
  }
  if(tripExtras.stay) {
    for(const p of lodgingAreas(D.stays.filter(s=>s.type!=='campsite'))) {
      if(points.some(point=>C.distanceMiles(point,[p.lat,p.lng])<=35)) {addLodgingPin(layer,p);shown.push(p);}
    }
  }
  return shown;
}
function drawTripMap() {
  if(activeTab!=='trip' || !window.L || !$('trip-map')) return;
  if(tripMap) tripMap.remove();
  tripMap = L.map('trip-map',{scrollWheelZoom:false,fadeAnimation:false});
  L.tileLayer(D.mapConfig?.voyager || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,subdomains:'abcd',attribution:'© OpenStreetMap'+(D.mapConfig?.voyager?' © CARTO':'')}).addTo(tripMap);
  tripPins=[];
  const pointLayer=typedClusterLayer(tripMap), shown=[];
  tripPlan().days.forEach((day,index)=>{
    if(tripDay!=='all' && Number(tripDay)!==index) return;
    day.stops.filter(s=>!s.optional).forEach(s=>{
      const p=byId.get(s.id);
      if(!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
      tripPins.push({id:p.id,lat:p.lat,lng:p.lng,day:index});
      tripMarker(pointLayer,p,String(index+1),index);shown.push(p);
    });
  });
  const points=tripPins.map(p=>[p.lat,p.lng]);
  if(points.length>1) L.polyline(points,{color:'#91d4c7',weight:3,dashArray:'7 8'}).addTo(tripMap);
  const nearby=addTripNearby(pointLayer,points);shown.push(...nearby);
  if(shown.length) tripMap.fitBounds(L.latLngBounds(shown.map(p=>[p.lat,p.lng])).pad(.16),{maxZoom:11});
  else tripMap.setView([28.7,-82],6);
  mapLegend($('trip-legend'),shown.map(pinKind));
  observeMapSize(tripMap);
  $('trip-map-status').textContent=`${tripPins.length} mapped stops${nearby.length?' · '+nearby.length+' nearby places':''}. Symbol-and-count badges group nearby places of the same type; tap to zoom. D badges mark trip days.`;
}
