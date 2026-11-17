"use strict";
// App part 8 of 8: start-up. Runs last in the bundle (see app-files.json), after every
// other app file has declared its state and functions: fills the category chips and
// region list, renders each view once and exposes the read-only test hook.
setupMapFilters();
['North Florida','Central Florida','South Florida','Florida Keys','Panhandle'].forEach(region=>{ const option=document.createElement('option'); option.value=region; option.textContent=region; $('region').appendChild(option); });
$('total-badge').textContent = D.places.length;
$('method-content').innerHTML = (D.method || []).map(p=>`<p>${esc(p)}</p>`).join('');
setupPlannerFilters(); setupMobile(); renderExplore(false); setupMap(); restoreMapView(); persist();
globalThis.FieldGuide = { get count(){return D.places.length;}, get visibleIds(){return visible.map(p=>p.id);}, get markerCount(){return markerById.size;}, get picks(){return structuredClone(picks);}, get selectedId(){return selectedId;}, get map(){return map;}, get data(){return D;}, get tripPins(){return structuredClone(tripPins);}, get stayMapPins(){return structuredClone(stayMapPins);}, get tripMap(){return tripMap;}, get staysMap(){return staysMap;} };
