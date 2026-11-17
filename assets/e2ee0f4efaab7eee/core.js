'use strict';
{
  const root = globalThis;
  const KEY = root.document?.documentElement?.dataset.edition === 'share' ? 'florida-field-guide-shared-v1' : 'florida-field-guide-shared-v1';
  function visitFor(place, picks = {}) {
    return picks[place.id]?.visit || { status: (place.userVisit ?? place.visited) === true ? 'done' : 'none', date: '', updated: 0 };
  }
  function seedVisits(picks, seeds = {}) {
    const result = { ...picks };
    for (const [id, visit] of Object.entries(seeds)) {
      if (!result[id]?.visit) result[id] = { pick: '', note: '', day: '', updated: 0, ...result[id], visit: { ...visit } };
    }
    return validateBackup({ version: 1, picks: result });
  }
  function distanceMiles(a, b) {
    if (![...a, ...b].every(v => typeof v === 'number' && Number.isFinite(v))) return null;
    const r = Math.PI / 180;
    const dLat = (b[0] - a[0]) * r;
    const dLng = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
    return 3958.7613 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  }

  // Place filters. Each test is truthy when the place must be left out.
  function excludedByText(p, query) {
    return query && ![p.name, p.area, p.region, p.why, p.experience, ...(p.aliases || []), ...p.categories].join(' ').toLowerCase().includes(query);
  }
  function excludedByCategory(p, filter) {
    if (Array.isArray(filter.mapTypes) && !filter.mapTypes.includes(mapKind(p))) return true;
    return filter.category && filter.category !== 'all' && !p.categories.includes(filter.category);
  }
  function mapKind(p) {
    return p.camp ? 'camp' : p.stayArea ? 'stay' : p.categories?.[0] || 'adventure';
  }
  function hasDocumentedFamilyFit(p) {
    return p.visitor?.family?.friendly === true && p.visitor.family.reason && /^https:\/\//.test(p.visitor.family.sourceUrl || '');
  }
  function hasFreeEntry(p) {
    return p.visitor?.price?.kind === 'entry' && p.visitor.price.amount === 0;
  }
  function excludedByVisitorInfo(p, filter) {
    if (filter.familyFriendly && !hasDocumentedFamilyFit(p)) return true;
    if (filter.freeEntry && !hasFreeEntry(p)) return true;
    return filter.amenity && !(p.visitor?.amenities || []).includes(filter.amenity);
  }
  // Camping cost: 'free' keeps only free campsites, 'paid' only priced ones; unknown prices match neither.
  function excludedByCampCost(p, filter) {
    if (Array.isArray(filter.mapTypes) && !p.camp) return false;
    if (filter.campCost === 'free') return p.camp?.free !== true;
    if (filter.campCost === 'paid') return p.camp?.free !== false;
    return false;
  }
  function excludedByRegion(p, filter) {
    return filter.region && filter.region !== 'all' && p.region !== filter.region && regionFor(p)!==filter.region;
  }
  function regionFor(p) {
    if(p.region==='Panhandle')return 'Panhandle';
    if(p.region==='South Florida & Keys')return /keys|key west|key largo|islamorada|marathon/i.test(p.area||'')||p.lat<25.3?'Florida Keys':'South Florida';
    if(['Gainesville & Suwannee','St Augustine & Northeast'].includes(p.region))return 'North Florida';
    return 'Central Florida';
  }
  function campStyleMatches(c,style) {
    if(!style||style==='all')return true;
    if(!c)return false;
    if(style==='primitive')return ['primitive','dispersed','hunt-camp'].includes(c.kind)&&c.power===false;
    if(style==='no-power')return c.power===false;
    if(style==='no-facilities')return c.power===false&&c.water===false&&c.toilets===false;
    return style==='developed'&&c.kind==='developed';
  }
  function excludedByConditions(p, filter) {
    return filter.hideClosed && p.conditions.status === 'closed';
  }
  function excludedByVisitState(p, filter, picks) {
    const visited = visitFor(p, picks).status !== 'none';
    if (filter.hideVisited && visited) return true;
    return filter.visitedOnly && !visited;
  }
  function excludedBySaved(p, filter, picks) {
    return filter.savedOnly && !['yes', 'maybe'].includes(picks[p.id]?.pick);
  }
  function excludedByDistance(p, filter) {
    if (!(filter.maxMiles && filter.base)) return false;
    const d = distanceMiles(filter.base, [p.lat, p.lng]);
    return d === null || d > filter.maxMiles;
  }
  // The tests run in this order and stop at the first exclusion.
  function placeMatches(p, filter, picks, query) {
    if (excludedByText(p, query)) return false;
    if (excludedByCategory(p, filter)) return false;
    if (excludedByVisitorInfo(p, filter)) return false;
    if (excludedByCampCost(p, filter)) return false;
    if (p.camp && !campStyleMatches(p.camp,filter.campStyle)) return false;
    if (excludedByRegion(p, filter)) return false;
    if (excludedByConditions(p, filter)) return false;
    if (excludedByVisitState(p, filter, picks)) return false;
    if (excludedBySaved(p, filter, picks)) return false;
    return !excludedByDistance(p, filter);
  }
  function filterPlaces(places, filter = {}, picks = {}) {
    const query = (filter.query || '').trim().toLowerCase();
    return places.filter(p => placeMatches(p, filter, picks, query));
  }

  // Backup validation. Checks run in this order; the first failure decides the error message.
  function assertBackupShape(input) {
    if (!input || input.version !== 1 || !input.picks || Array.isArray(input.picks) || typeof input.picks !== 'object') throw new Error('This is not a Florida Field Guide backup.');
  }
  function assertPlaceIdentity(id) {
    if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(id) || ['constructor', 'prototype'].includes(id)) throw new Error('Invalid place identity.');
  }
  function assertSavedChoice(p) {
    if (!p || !['yes', 'maybe', 'no', ''].includes(p.pick) || typeof p.note !== 'string' || p.note.length > 10000 || !Number.isFinite(p.updated) || p.updated < 0) throw new Error('A saved choice is malformed. Nothing was imported.');
  }
  function assertSavedDay(p) {
    if (p.day !== undefined && (typeof p.day !== 'string' || (p.day && !/^\d{4}-\d{2}-\d{2}$/.test(p.day)))) throw new Error('A saved date is malformed.');
  }
  function assertSavedVisit(v) {
    if (!v || !['done', 'likely', 'none'].includes(v.status) || typeof v.date !== 'string' || !Number.isFinite(v.updated) || v.updated < 0) throw new Error('A saved visit is malformed. Nothing was imported.');
    if (v.date && (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(Date.parse(v.date)) || new Date(v.date).toISOString().slice(0, 10) !== v.date)) throw new Error('A visit date is malformed. Nothing was imported.');
  }
  function assertSavedEntry(id, p) {
    assertPlaceIdentity(id);
    assertSavedChoice(p);
    assertSavedDay(p);
    if (p.visit !== undefined) assertSavedVisit(p.visit);
    if (p.review !== undefined) assertSavedReview(p.review);
  }
  function assertSavedReview(r) {
    if(!r||!Number.isInteger(r.stars)||r.stars<0||r.stars>5||typeof r.text!=='string'||r.text.length>10000||!Number.isFinite(r.updated)||r.updated<0)throw new Error('A saved review is malformed. Nothing was imported.');
    assertSavedVisit({status:'done',date:r.date,updated:r.updated});
    if(typeof r.time!=='string'||r.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time))throw new Error('A review time is malformed. Nothing was imported.');
  }
  function validateBackup(input) {
    assertBackupShape(input);
    const entries = Object.entries(input.picks);
    if (entries.length > 5000) throw new Error('Backup is too large.');
    for (const [id, p] of entries) assertSavedEntry(id, p);
    return input.picks;
  }

  function mergeBackup(current, input) {
    const incoming = validateBackup(input);
    const merged = { ...current };
    for (const [id, p] of Object.entries(incoming)) {
      const existing = merged[id];
      const choice = !existing || p.updated > existing.updated ? { pick: p.pick, note: p.note, updated: p.updated, day: p.day || '' } : { ...existing };
      const visit = p.visit && (!existing?.visit || p.visit.updated > existing.visit.updated) ? p.visit : existing?.visit;
      if (visit) choice.visit = { ...visit };
      const review=p.review&&(!existing?.review||p.review.updated>existing.review.updated)?p.review:existing?.review;
      if(review)choice.review={...review};
      merged[id] = choice;
    }
    return merged;
  }
  function load(getStorage) {
    try {
      const raw = getStorage().getItem(KEY);
      return { ok: true, picks: raw ? validateBackup(JSON.parse(raw)) : {} };
    } catch (error) { return { ok: false, picks: {}, error: String(error.message || error) }; }
  }
  function save(getStorage, picks) {
    try {
      validateBackup({ version: 1, picks });
      getStorage().setItem(KEY, JSON.stringify({ version: 1, picks }));
      return { ok: true };
    } catch (error) { return { ok: false, error: String(error.message || error) }; }
  }
  function directionsUrl(stops) {
    const encoded = value => encodeURIComponent(value);
    let url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
    if (!stops.length) return 'https://www.google.com/maps';
    if (stops.length > 1) url += '&origin=' + encoded(stops[0]);
    url += '&destination=' + encoded(stops.at(-1));
    if (stops.length > 2) url += '&waypoints=' + encoded(stops.slice(1, -1).join('|'));
    return url;
  }
  root.FloridaCore = { distanceMiles, filterPlaces, mapKind, regionFor, campStyleMatches, mergeBackup, validateBackup, load, save, directionsUrl, seedVisits, visitFor };
}
