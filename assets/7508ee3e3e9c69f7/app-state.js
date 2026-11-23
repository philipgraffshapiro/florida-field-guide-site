"use strict";
// App part 1 of 8 (see app-files.json): the embedded catalog, shared libraries,
// escaping and link helpers, mutable view state, the layout height and the place
// label helpers every view uses. Later app files read this state directly.
const D = globalThis.FLORIDA_DATA || JSON.parse(document.getElementById('field-data').textContent);
const C = globalThis.FloridaCore;
const R = globalThis.FloridaRatings;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
const link = (url, text, cls = '') => `<a class="${cls}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;
const byId = new Map(D.places.map(p => [p.id, p]));
const bases = { ocala: [29.1872,-82.1401], citra: [29.4119, -82.1098], tampa: [27.9506, -82.4572], orlando: [28.5383, -81.3792], staugustine: [29.9012, -81.3124], miami: [25.7617, -80.1918] };
const loaded = C.load(() => window.localStorage);
let picks = C.seedVisits(loaded.picks, D.initialVisits), storageBlocked = !loaded.ok, selectedId = null, activeTab = 'explore', branch = D.branches?.[0]?.id;
let map, tiles, markers, socialLayer, routeLayer, light = document.documentElement.dataset.theme==='light', visible = [], toastTimer;
let listLimit = 12, exploreView = 'map', savedView = 'plans';
// The phone's position once found, the places listed under the map, and the
// map area they come from (null shows all of Florida).
let userLocation = null, listed = [], mapArea = null;
const basePoint = () => bases[$('base').value] || bases.citra;
// Driving directions start from the phone when "My location" is the base; Google
// Maps uses the live position when no origin is given for a single destination.
function directionStops(...stops) {
  if ($('base').value !== 'me' || !userLocation) return [$('base').selectedOptions[0].text+', Florida',...stops];
  return stops.length > 1 ? [userLocation.join(','),...stops] : stops;
}
let tripMap, tripPins = [], tripDay = 'all', tripExtras = {camp:true,work:true,stay:true};
const highlight = p => {
  const h = globalThis.FloridaHighlights(p);
  return {...h,attention:[h.attention,p.accessMode === 'boat' ? 'Boat access · arrange transport' : ''].filter(Boolean).join(' · ')};
};
const resizeApp = () => { if(map)map.invalidateSize(); if(tripMap)tripMap.invalidateSize(); };
resizeApp(); window.addEventListener('resize', resizeApp);
const markerById = new Map();
const categoryOptions = [['all','Everything','✧'],['beach','Beaches','☼'],['spring','Springs','◉'],['camp','Camping','⛺'],['stay','Rooms & rentals','⌂'],['work','Work spots','▣'],['wildlife','Wildlife','⌁'],['paddle','Paddle','↝'],['swim','Swim','≈'],['snorkel','Snorkel','◇'],['dive','Dive','↓'],['boardwalk','Boardwalks','≡'],['hike','Trails','△'],['cave','Caves','⌂'],['aquarium','Aquariums','⋈'],['range','Ranges','⊙'],['adventure','Adventure','↗']];
const tone = p => p.categories.includes('camp') ? 'camp' : p.categories.some(c => ['spring','swim','snorkel','paddle','dive'].includes(c)) ? 'spring' : p.categories.some(c => ['wildlife','boardwalk','hike'].includes(c)) ? 'wildlife' : 'adventure';
const pick = id => picks[id] || { pick: '', note: '', day: '', updated: 0 };
const visit = p => C.visitFor(p, picks);
const visitDate = value => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value+'T12:00:00Z')) : 'Earlier visit';
const today = () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/New_York' }).format(new Date());
const fieldText = v => Array.isArray(v) ? v.join(' · ') : typeof v === 'object' && v ? Object.values(v).filter(x => typeof x === 'string').join(' · ') : String(v ?? 'Not established');
const destination = p => p.navigationAddress || p.navigationDestination || (Number.isFinite(p.lat) && Number.isFinite(p.lng) ? `${p.lat},${p.lng}` : `${p.name}, ${p.area}, Florida`);
const officialSite = p => p.visitor?.website || p.sources.find(s=>['official','operator'].includes(s.type))?.url;
const priceLabel = p => p.visitor?.price?.label || highlight(p).price.replace(/\*/g,'');
const placeName = p => officialSite(p) ? link(officialSite(p),highlight(p).name,'place-website') : esc(highlight(p).name);
const familyFriendly = p => p.visitor?.family?.friendly === true && p.visitor.family.reason && /^https:\/\//.test(p.visitor.family.sourceUrl || '');
const activityLabel = p => ({beach:'Beach',spring:'Spring',wildlife:'Wildlife',paddle:'Paddling',swim:'Swimming',snorkel:'Snorkeling',dive:'Diving',boardwalk:'Boardwalk',hike:'Trail',cave:'Cave',aquarium:'Aquarium',range:'Range',adventure:'Adventure',camp:'Camping',work:'Work spot'}[p.categories[0]] || 'Explore');
