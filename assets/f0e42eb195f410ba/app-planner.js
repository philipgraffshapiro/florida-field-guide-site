"use strict";
// Shared controls keep saving and filtering consistent across the planner.
function saveButton(p, cls = '') {
  const saved = pick(p.id).pick === 'yes';
  return `<button class="save-place ${cls}${saved?' saved':''}" data-pick="${saved?'':'yes'}" data-id="${esc(p.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${esc(p.name)}"><span aria-hidden="true">${saved?'♥':'♡'}</span><span>${saved?'Saved':'Save'}</span></button>`;
}
function syncSaveButtons() {
  document.querySelectorAll('.save-place,.photo-save').forEach(button => {
    const saved = pick(button.dataset.id).pick === 'yes';
    const p = byId.get(button.dataset.id) || D.stays.find(s=>s.id===button.dataset.id);
    button.dataset.pick = saved ? '' : 'yes';
    button.classList.toggle('saved',saved);
    button.setAttribute('aria-pressed',String(saved));
    button.setAttribute('aria-label',`${saved?'Unsave':'Save'} ${p?.name || 'place'}`);
    button.innerHTML = button.classList.contains('photo-save') ? (saved?'♥':'♡') : `<span aria-hidden="true">${saved?'♥':'♡'}</span><span>${saved?'Saved':'Save'}</span>`;
  });
}
function setupPlannerFilters() {
  $('quick-categories').innerHTML = '';
  $('saved-category').innerHTML='<option value="all">Every category</option>'+categoryOptions.filter(([id])=>id!=='all').map(([id,name])=>`<option value="${id}">${esc(name)}</option>`).join('');
  for(const id of ['quick-region','saved-region']) $(id).innerHTML = $('region').innerHTML;
  $('quick-region').addEventListener('change',()=>{$('region').value=$('quick-region').value;renderExplore(true);});
  $('quick-camp-cost').addEventListener('change',()=>{$('camp-cost').value=$('quick-camp-cost').value;renderExplore(false);});
  for(const id of ['saved-category','saved-region']) $(id).addEventListener('change',renderSaved);
}
function syncPlannerFilters() {
  $('quick-region').value = $('region').value;
  $('quick-camp-cost').value = $('camp-cost').value;
  $('quick-camp-row').hidden = !enabledMapTypes.has('camp') || enabledMapTypes.size>2;
  syncMapFilters();
}
function boardMatches(p) {
  const type = $('saved-category').value, region = $('saved-region').value;
  return (type==='all' || (type==='stay' ? !!p.type : p.categories?.includes(type))) && (region==='all' || C.regionFor(p)===region);
}
function stayCardsApi() {
  return {card,saveButton,pick,byId,esc,link,drawStaysMap,mapLegend};
}
