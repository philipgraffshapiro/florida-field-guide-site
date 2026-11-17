"use strict";
// App part 7 of 8: user input. One delegated click handler runs the first matching
// button action from clickActions; the rest wire inputs, dialogs, backup and routes.
function openRatings(button) {
  if(selectedId!==button.dataset.rating || !$('place-dialog').open) openPlace(button.dataset.rating);
  const section=$('detail').querySelector('[data-section="ratings"]');
  section.open=true;
  section.scrollIntoView({block:'nearest'});
}
function toggleVisit(button) {
  const p=byId.get(button.dataset.visit);
  updateVisit(p.id,visit(p).status==='done'?'none':'done');
}
function chooseSavedView(button) {
  savedView=button.dataset.savedView;
  renderSaved();
}
function choosePick(button, event) {
  event.stopPropagation();
  updatePick(button.dataset.id,button.dataset.pick);
}
function chooseCategory(button) {
  listLimit=12;
  const kind=button.dataset.category;
  if(enabledMapTypes.has(kind)) enabledMapTypes.delete(kind); else enabledMapTypes.add(kind);
  persistMapTypes();renderExplore(false);
}
function chooseBranch(button) {
  branch = button.dataset.branch;
  renderTrip();
}
function saveDay(button) {
  const day = tripPlan().days.find(x=>x.key===button.dataset.saveDay);
  if(!day) return;
  day.stops.filter(s=>!s.optional).forEach(s=>{ if(byId.has(s.id)) picks[s.id]={...pick(s.id),pick:'yes',day:day.isoDate || '',updated:Date.now()}; });
  persist(); renderSaved(); renderExplore(false); syncSaveButtons();
  toast('Main outing saved. Add alternatives individually if you want them.');
}
// [test, action] pairs in priority order. A button can carry several data
// attributes (a photo heart has data-pick and data-id); the first test that passes wins.
const clickActions = [
  [button => button.dataset.rating, openRatings],
  [button => button.dataset.visit, toggleVisit],
  [button => button.dataset.clearVisit, button => updateVisit(button.dataset.clearVisit,'none')],
  [button => button.dataset.savedView, chooseSavedView],
  [button => button.hasAttribute('data-pick'), choosePick],
  [button => button.dataset.tab, button => showTab(button.dataset.tab==='practical'&&activeTab==='practical'?'explore':button.dataset.tab,button.dataset.view)],
  [button => button.dataset.open, button => openPlace(button.dataset.open)],
  [button => button.hasAttribute('data-reset'), () => resetFilters()],
  [button => button.dataset.category, chooseCategory],
  [button => button.dataset.branch, chooseBranch],
  [button => button.hasAttribute('data-focus-day'), button => {tripDay=button.dataset.focusDay;$('trip-day-filter').value=tripDay;filterTripDays();drawTripMap();$('trip-map').scrollIntoView({block:'center',behavior:'smooth'});} ],
  [button => button.dataset.saveDay, saveDay]
];
document.addEventListener('click',event=>{
  const button = event.target.closest('button');
  const action = button && clickActions.find(([matches]) => matches(button));
  if (action) action[1](button, event);
});
document.addEventListener('input',event=>{
  if (['place-note','place-day'].includes(event.target.id)) { const id = event.target.dataset.id; picks[id] = {...pick(id),[event.target.id==='place-note'?'note':'day']:event.target.value,updated:Date.now()}; persist(); renderSaved(); }
});
document.addEventListener('change',event=>{if(event.target.id==='visit-day'){const p=byId.get(event.target.dataset.id);updateVisit(p.id,visit(p).status,event.target.value);}});
let searchTimer;
$('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{listLimit=12;renderExplore(false);},120);});
['activity','region','sort','base','radius','hide-closed','hide-visited','family-friendly','free-entry','amenity','camp-cost','camp-style'].forEach(id=>$(id).addEventListener('change',()=>{listLimit=12;renderExplore(['region','radius'].includes(id));}));
document.addEventListener('error',event=>{if(event.target.matches?.('img.place-photo')){event.target.hidden=true;event.target.closest('.photo-frame,.detail-photo,.peek-photo')?.classList.add('photo-failed');}},true);
$('filters-toggle').addEventListener('click',()=>$('filters-dialog').showModal());
$('close-filters').addEventListener('click',()=>$('filters-dialog').close());
$('filters-dialog').addEventListener('close',()=>$('filters-toggle').focus({preventScroll:true}));
$('apply-filters').addEventListener('click',()=>$('filters-dialog').close());
$('close-detail').addEventListener('click',()=>$('place-dialog').close());
$('detail-next').addEventListener('click',()=>{const i=visible.findIndex(p=>p.id===selectedId);if(visible.length)selectPlace(visible[(i+1)%visible.length].id,false);});
$('show-more-places').addEventListener('click',()=>{listLimit+=12;renderExplore(false);});
$('reset-filters').addEventListener('click',()=>resetFilters());
$('export').addEventListener('click',()=>download('Florida-Field-Guide-my-picks.json',{version:1,exported:new Date().toISOString(),picks}));
$('export-catalog').addEventListener('click',()=>download('Florida-Field-Guide-catalog.json',{researched:D.researched,places:D.places,branches:D.branches,loops:D.loops,stays:D.stays}));
$('import').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async event=>{
  const file = event.target.files[0]; if(!file) return;
  try { if(file.size>5_000_000) throw new Error('Backup is too large.'); const incoming = JSON.parse(await file.text()); picks = C.mergeBackup(picks,incoming); persist(); renderExplore(false); renderSaved(); if(selectedId) renderDetail(byId.get(selectedId)); toast('Backup merged. Newer choices were kept.'); } catch(error) { toast(error.message || 'Import failed. Your existing choices were kept.'); } finally { event.target.value=''; }
});
$('route-picks').addEventListener('click',()=>{
  const saved = C.filterPlaces(D.places,{savedOnly:true},picks).sort((a,b)=>(pick(a.id).day || '9999').localeCompare(pick(b.id).day || '9999') || a.priority-b.priority);
  if(!saved.length) return toast('Save a few places first.');
  if(saved.length>9) return toast('Google Maps accepts a limited route. Assign a day and open individual day directions, or choose up to 9 saved places.');
  if(saved.some(p=>p.navigationBlocked)) return toast('A saved place needs a confirmed launch or meeting point. Open its details before routing.');
  window.open(C.directionsUrl([$('base').selectedOptions[0].text+', Florida',...saved.map(destination)]),'_blank','noopener,noreferrer');
});
