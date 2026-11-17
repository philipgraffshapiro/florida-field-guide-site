'use strict';
{
  function optionList(values,esc) {return values.map(v=>`<option>${esc(v)}</option>`).join('');}
  function stayFilterFields(D,esc) {
    return `<div class="stay-filters"><label>Stay type<select id="stay-kind"><option value="all">All stays</option><option value="camping">All campsites</option><option value="primitive">Primitive / no hookups</option><option value="no-facilities">No power, water or toilets</option><option value="private">Private rooms</option><option value="entire">Entire places & campers</option></select></label><label>Region<select id="stay-region"><option value="all">All Florida</option>${optionList(['North Florida','Central Florida','South Florida','Florida Keys','Panhandle'],esc)}</select></label><label>Camping cost<select id="stay-camp-cost"><option value="all">Free & paid</option><option value="free">Free only</option><option value="paid">Paid only</option></select></label><label>Town<select id="stay-city"><option value="all">All towns</option>${optionList([...new Set([...D.stays,...D.places.filter(p=>p.camp)].map(p=>p.area))].sort(),esc)}</select></label></div><div class="stay-budget-row"><label>Min / night ($)<input type="number" id="stay-min-budget" min="0" step="any" placeholder="0"></label><label>Max / night ($)<input type="number" id="stay-budget" min="0" step="any" placeholder="Any price"></label></div><div class="stay-checks"><label class="check-label"><input type="checkbox" id="stay-showers"> Showers</label><label class="check-label"><input type="checkbox" id="stay-power"> Electric hookups</label></div><select id="stay-window" hidden><option value="all">All options</option></select>`;
  }
  function staySearchFields() {
    return `<h3>Search booking sites</h3><div class="stay-search"><label>Town or area<input id="stay-town" placeholder="e.g. Crystal River"></label><label>Guests<input id="stay-guests" type="number" min="1" max="16" value="1"></label><label>Check in<input id="stay-in" type="date"></label><label>Check out<input id="stay-out" type="date"></label></div><div id="stay-search-links" class="stay-search-links"></div><p class="private-note">Booking-site results open there. This map shows the guide’s researched stays.</p>`;
  }
  function frame(D,esc) {
    return `<div class="stays-toolbar"><h1>Stays</h1><button id="stay-filters-toggle" class="outline" aria-haspopup="dialog">Search & filters</button></div><p class="updated-label">Room prices updated Oct 26, 2026 · Camping updated Nov 12, 2026</p><p id="stay-result-count" class="private-note" role="status"></p><div class="stays-layout"><aside class="stays-map-column"><div id="stays-map" aria-label="Camping and accommodation areas on the map"></div><div id="stays-legend" class="map-legend" hidden></div></aside><div><div id="stay-results" class="stays-grid"></div><button id="more-stays" class="outline load-more">Show more stays</button></div></div><dialog id="stay-filters-dialog" aria-labelledby="stay-filters-title"><header class="sheet-top"><h2 id="stay-filters-title">Find a stay</h2><button class="modal-close" data-close="stay-filters-dialog">× Close</button></header><div class="sheet-content">${stayFilterFields(D,esc)}<p id="stay-filter-error" role="alert"></p>${staySearchFields()}</div><footer class="stay-dialog-actions"><button id="reset-stay-filters" class="outline">Reset</button><button id="apply-stay-filters" class="primary">Show on map</button></footer></dialog>`;
  }
  function read() {
    const el=id=>document.getElementById(id),number=id=>el(id).value===''?null:Number(el(id).value);
    return {window:'all',region:el('stay-region').value,kind:el('stay-kind').value,minNight:number('stay-min-budget'),maxNight:number('stay-budget'),city:el('stay-city').value,cost:el('stay-camp-cost').value,showers:el('stay-showers').checked,power:el('stay-power').checked};
  }
  function valid() {
    const el=id=>document.getElementById(id),f=read();
    if(!['stay-min-budget','stay-budget','stay-guests','stay-in','stay-out'].every(id=>el(id).reportValidity()))return false;
    const message=f.minNight!==null&&f.maxNight!==null&&f.minNight>f.maxNight?'Minimum price must be below maximum price.':el('stay-in').value&&el('stay-out').value&&el('stay-out').value<=el('stay-in').value?'Check out must be after check in.':'';
    el('stay-filter-error').textContent=message;return !message;
  }
  globalThis.FloridaStayForm={frame,read,valid};
}
