"use strict";
// Map types are independent layers. Secondary activities remain a separate filter.
const mapTypeOptions = categoryOptions.filter(([id])=>!['all','stay'].includes(id));
const mapTypesKey = D.shared ? 'florida-map-types-shared-v1' : 'florida-map-types-personal-v1';
let enabledMapTypes = loadMapTypes();
function mapTypesFromList(ids) {
  if(ids.length===1&&ids[0]==='stay')return new Set(ids);
  return new Set(ids.filter(id=>mapTypeOptions.some(([type])=>type===id)));
}
function loadMapTypes() {
  const all=mapTypeOptions.map(([id])=>id);
  try {
    const saved=JSON.parse(localStorage.getItem(mapTypesKey));
    if(Array.isArray(saved)&&saved.every(id=>typeof id==='string')) return mapTypesFromList(saved);
  } catch(error) { console.error('Map filters could not be restored:',error); }
  return new Set(all);
}
function persistMapTypes() {
  try { localStorage.setItem(mapTypesKey,JSON.stringify([...enabledMapTypes])); }
  catch(error) {
    console.error('Map filters could not be saved:',error);
    toast('Map choices work for this visit. This browser could not save them.');
  }
}
function setMapTypes(mode) {
  enabledMapTypes=mapTypesFromList(mode==='all'?mapTypeOptions.map(([id])=>id):[mode]);
  persistMapTypes();listLimit=12;renderExplore(false);
}
function mapTypeButton(id,name,compact=false) {
  return `<button class="${compact?'chip':'map-type-toggle'}" data-category="${id}" aria-pressed="${enabledMapTypes.has(id)}" style="--pin:${PIN_TYPES[id][1]}"><span class="filter-glyph">${pinGlyph(id)}</span><span class="filter-name">${esc(name)}</span>${compact?'':'<span class="type-count"></span>'}<span class="toggle-state" aria-hidden="true"></span></button>`;
}
function setupMapFilters() {
  $('categories').innerHTML=mapTypeOptions.map(([id,name])=>mapTypeButton(id,name)).join('');
  $('activity').innerHTML=categoryOptions.filter(([id])=>!['camp','stay','work'].includes(id)).map(([id,name])=>`<option value="${id}">${id==='all'?'Any activity':esc(name)}</option>`).join('');
  document.querySelectorAll('[data-map-types]').forEach(b=>b.addEventListener('click',()=>setMapTypes(b.dataset.mapTypes)));
  $('rental-map-toggle').addEventListener('click',()=>setMapTypes(rentalMapOnly()?'all':'stay'));
}
const rentalMapOnly=()=>enabledMapTypes.size===1&&enabledMapTypes.has('stay');
const rentalMapNeedsData=()=>rentalMapOnly()&&!!globalThis.FloridaSiteData&&!globalThis.FloridaSiteData.panelsReady;
function syncMapFilters() {
  const candidates=C.filterPlaces(D.places,{...filters(),mapTypes:mapTypeOptions.map(([id])=>id)},picks);
  const counts={};
  candidates.forEach(p=>{const kind=pinKind(p);counts[kind]=(counts[kind]||0)+1;});
  document.querySelectorAll('[data-category]').forEach(button=>{
    const kind=button.dataset.category,on=enabledMapTypes.has(kind);
    button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));
    const counter=button.querySelector('.type-count');
    if(counter)counter.textContent=counts[kind]||0;
  });
  const count=enabledMapTypes.size,total=mapTypeOptions.length;
  $('rental-map-toggle').classList.toggle('active',rentalMapOnly());
  $('rental-map-toggle').setAttribute('aria-pressed',String(rentalMapOnly()));
  $('filters-toggle').textContent=rentalMapOnly()?'Filters · rentals':`Filters${count===total?'':` · ${count}`}`;
  $('map-types-summary').textContent=rentalMapOnly()?'Rooms & rentals only':`${count} of ${total} types on`;
}
function syncMapResults(points,areas) {
  const rental=rentalMapOnly(), needsData=rentalMapNeedsData(), count=rental?areas.length:points.length;
  $('map-result-count').textContent=needsData?'':`${count} ${rental?'rental areas':'places'}`;
  $('map-empty').hidden=!!count;
  $('map-empty-message').textContent=mapEmptyMessage(rental,needsData);
  $('map-empty-action').textContent=enabledMapTypes.size?'Clear filters':'Show all types';
  $('apply-filters').textContent=needsData?'View map':`View map · ${count}`;
}
function mapEmptyMessage(rental,needsData) {
  if(needsData)return 'Rooms and rentals are not loaded. Open Places to check or retry.';
  if(rental)return 'No rental areas match these filters.';
  return enabledMapTypes.size?'No places match these filters.':'All map types are off.';
}
