"use strict";
// Find my location: an arrow button on the map, a blue dot that follows the phone,
// closest-first sorting and a list limited to the map area once zoomed in.
// Uses Leaflet's own locate/stopLocate (browser geolocation; HTTPS or file only).
const AREA_ZOOM = 9, FLORIDA_BOUNDS = [[24.4,-87.7],[31.1,-79.9]];
let locationDot = null, accuracyRing = null, centerOnFix = false, locateAsked = false, watching = false, listedFrom = null;
function locateButton() {
  const button=L.DomUtil.create('button','locate-button');
  button.id='locate-me';button.type='button';button.title='Show my location';
  button.setAttribute('aria-label','Show my location');
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8-8-2Z"/></svg>';
  L.DomEvent.disableClickPropagation(button);
  button.addEventListener('click',()=>locateMe(true,true));
  return button;
}
function setupLocate() {
  const control=L.control({position:'bottomleft'});
  control.onAdd=locateButton;control.addTo(map);
  map.on('locationfound',showLocation);map.on('locationerror',locationFailed);
  map.on('moveend',syncMapArea);
  // A phone that already allowed this site opens on its position, like a trail app,
  // unless the address asks for a specific map view.
  navigator.permissions?.query({name:'geolocation'}).then(status=>{
    if(status.state==='granted')locateMe(!new URLSearchParams(location.hash.slice(1)).has('lat'),false);
  }).catch(error=>console.error('Location permission could not be read:',error));
}
function locateMe(center,asked) {
  centerOnFix=center;locateAsked=asked;
  if(userLocation&&watching&&center){centerOnFix=false;map.setView(userLocation,Math.max(map.getZoom(),11),{animate:false});return;}
  $('locate-me').classList.add('locating');
  map.stopLocate();watching=true;
  map.locate({watch:true,enableHighAccuracy:true,maximumAge:15000,timeout:20000});
}
function drawLocation(event) {
  if(!locationDot){
    accuracyRing=L.circle(event.latlng,{radius:event.accuracy,interactive:false,stroke:false,fillColor:'#2f7cf6',fillOpacity:.15}).addTo(map);
    locationDot=L.marker(event.latlng,{icon:L.divIcon({className:'location-dot',html:'<span></span>',iconSize:[24,24],iconAnchor:[12,12]}),interactive:false,keyboard:false,zIndexOffset:2000}).addTo(map);
    return;
  }
  accuracyRing.setLatLng(event.latlng).setRadius(event.accuracy);locationDot.setLatLng(event.latlng);
}
function useMyLocation() {
  if(!$('base').querySelector('option[value="me"]'))$('base').insertAdjacentHTML('afterbegin','<option value="me">My location</option>');
  $('base').value='me';$('sort').value='distance';listLimit=12;
}
function showLocation(event) {
  const first=!userLocation;
  userLocation=[event.latlng.lat,event.latlng.lng];bases.me=userLocation;
  $('locate-me').classList.remove('locating');$('locate-me').classList.add('active');
  drawLocation(event);
  if(first||locateAsked)useMyLocation();
  locateAsked=false;
  if(centerOnFix){centerOnFix=false;map.setView(event.latlng,Math.max(map.getZoom(),11),{animate:false});}
  // Re-sort when the phone has moved a quarter mile; tiny GPS jitter keeps the list still.
  if(!listedFrom||C.distanceMiles(listedFrom,userLocation)>0.25||first){listedFrom=userLocation;renderExplore(false);}
}
function locationFailed(event) {
  $('locate-me').classList.remove('locating');
  if(event.code===1){map.stopLocate();watching=false;}
  if(!locateAsked)return;
  locateAsked=false;centerOnFix=false;
  toast(event.code===1?'Location is blocked for this page. On iPhone: Settings → Privacy & Security → Location Services → Safari Websites → While Using the App. Then tap the arrow again.':'Could not find your location yet. Check that Location Services is on, then tap the arrow again.');
}
// Zoomed in, the list shows the map area; zoomed out to the state, it shows everything.
function syncMapArea() {
  const size=map.getSize();
  if(!size.x||!size.y)return;
  const next=map.getZoom()>=AREA_ZOOM?map.getBounds():null;
  if(next===mapArea||(next&&mapArea&&next.equals(mapArea)))return;
  mapArea=next;listLimit=12;renderExplore(false);
}
function showAllFlorida() {
  map.fitBounds(FLORIDA_BOUNDS,{animate:false});
  if(map.getZoom()>=AREA_ZOOM)map.setZoom(AREA_ZOOM-1,{animate:false});
}
