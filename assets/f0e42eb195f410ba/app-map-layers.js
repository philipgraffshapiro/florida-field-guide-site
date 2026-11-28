"use strict";
// Map or Satellite: one button on the map swaps the drawn street map for real aerial
// photos (Esri World Imagery) with road and place names on top, like a trail app's
// layer switch. The choice is remembered on this device.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const SATELLITE_CREDIT = 'Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';
let satelliteLayer = null, satelliteOn = false;
function esriTiles(path, options={}) {
  return L.tileLayer(ESRI+path+'/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:19,...options});
}
function satelliteTiles() {
  if (satelliteLayer) return satelliteLayer;
  satelliteLayer = L.layerGroup([
    esriTiles('World_Imagery',{attribution:SATELLITE_CREDIT}),
    esriTiles('Reference/World_Transportation',{maxNativeZoom:18}),
    esriTiles('Reference/World_Boundaries_and_Places',{maxNativeZoom:18})
  ]);
  return satelliteLayer;
}
function setSatellite(on) {
  satelliteOn = on;
  if (on) { map.removeLayer(tiles); satelliteTiles().addTo(map); }
  else { if (satelliteLayer) map.removeLayer(satelliteLayer); tiles.addTo(map); }
  $('map').classList.toggle('satellite-map',on);
  const button=$('map-layer');
  button.querySelector('span').textContent = on ? 'Map' : 'Satellite';
  button.setAttribute('aria-pressed',String(on));
  button.title = on ? 'Show the street map' : 'Show satellite photos';
}
function toggleSatellite() {
  setSatellite(!satelliteOn);
  try { localStorage.setItem('florida-map-layer',satelliteOn?'satellite':'map'); }
  catch { toast('Map view changed for this visit.'); }
}
function setupMapLayers() {
  const button=document.createElement('button');
  button.id='map-layer';button.type='button';button.className='map-layer-button';
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg><span>Satellite</span>';
  button.addEventListener('click',toggleSatellite);
  $('fit-map').before(button);
  let saved='map';
  try { saved=localStorage.getItem('florida-map-layer')||'map'; } catch (error) { console.error('Saved map view could not be read:',error); }
  setSatellite(saved==='satellite');
}
