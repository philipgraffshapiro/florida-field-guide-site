"use strict";
let browseState='peek';
function toggleExpandedMap() {
  const center=map.getCenter(),zoom=map.getZoom();
  const expanded=$('explore-panel').classList.toggle('expanded-map');
  $('fit-map').setAttribute('aria-label',expanded?'Exit expanded map':'Expand map');
  $('fit-map').setAttribute('aria-pressed',String(expanded));
  setBrowseState('peek');map.invalidateSize({pan:false});
  map.setView(center,zoom,{animate:false,reset:true});
}
function setBrowseState(state) {
  browseState=state;
  $('explore-panel').dataset.sheet=state;
  $('browse-handle').setAttribute('aria-expanded',String(state!=='peek'));
  $('browse-handle').setAttribute('aria-label',state==='peek'?'Show place photos':'Collapse place photos');
  if(activeTab==='explore')document.querySelectorAll('.tabs [data-view]').forEach(button=>{
    const active=button.dataset.view===(state==='peek'?'map':'list');
    button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
  });
}
function setupBrowseDrag() {
  const handle=$('browse-handle');let start=null,moved=false;
  handle.addEventListener('pointerdown',e=>{start=e.clientY;moved=false;handle.setPointerCapture(e.pointerId);});
  handle.addEventListener('pointermove',e=>{if(start!==null&&Math.abs(e.clientY-start)>12)moved=true;});
  handle.addEventListener('pointerup',e=>{
    if(start===null)return;
    const delta=e.clientY-start;start=null;
    if(moved)setBrowseState(delta<0?(browseState==='peek'?'middle':'full'):(browseState==='full'?'middle':'peek'));
  });
  handle.addEventListener('pointercancel',()=>{start=null;moved=false;});
  handle.addEventListener('click',()=>{if(!moved)setBrowseState(browseState==='peek'?'middle':'peek');moved=false;});
  handle.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){e.preventDefault();setBrowseState(browseState==='peek'?'middle':'full');}
    if(e.key==='ArrowDown'){e.preventDefault();setBrowseState(browseState==='full'?'middle':'peek');}
    if(e.key==='Escape')setBrowseState('peek');
  });
}
function toggleTheme() {
  light=!light;applyTheme();
  try{localStorage.setItem('florida-theme',light?'light':'dark');}
  catch{toast('Theme changed for this visit.');}
}
function applyTheme() {
  document.documentElement.dataset.theme=light?'light':'dark';
  $('theme-toggle').textContent=light?'Dark':'Light';
  $('theme-toggle').setAttribute('aria-label',`Switch to ${light?'dark':'light'} mode`);
  for(const id of ['map','stays-map'])$(id)?.classList.toggle('shared-map-dark',!light);
}
function setupMobile() {
  setBrowseState('peek');setupBrowseDrag();applyTheme();
  $('theme-toggle').addEventListener('click',toggleTheme);
  $('close-notes').addEventListener('click',()=>showTab('explore'));
  document.addEventListener('click',event=>{
    const close=event.target.closest('[data-close]');
    if(close)$(close.dataset.close).close();
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  }));
}
function restoreMapView() {
  const s=new URLSearchParams(location.hash.slice(1));
  if(!s.has('lat')){
    if(byId.has(s.get('place')))selectPlace(s.get('place'),true);
    return;
  }
  const lat=Number(s.get('lat')),lng=Number(s.get('lng')),z=Number(s.get('z'));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>85||Math.abs(lng)>180||!Number.isFinite(z))return;
  if(s.has('types'))enabledMapTypes=mapTypesFromList(s.get('types').split(','));
  for(const [key,id] of Object.entries({q:'search',region:'region',activity:'activity',camp:'camp-cost',style:'camp-style',amenity:'amenity',radius:'radius',base:'base'})){
    if(s.has(key)){const el=$(id),value=s.get(key);if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===value))el.value=value;}
  }
  for(const [key,id] of Object.entries({hideClosed:'hide-closed',hideVisited:'hide-visited',familyFriendly:'family-friendly',freeEntry:'free-entry'}))$(id).checked=s.get(key)==='1';
  renderExplore(false);map.setView([lat,lng],Math.max(5,Math.min(18,z)),{animate:false});
  if(byId.has(s.get('place')))selectPlace(s.get('place'),false);
}
