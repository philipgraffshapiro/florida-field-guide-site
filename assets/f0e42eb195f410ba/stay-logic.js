'use strict';
{
  const townName = value => String(value || '').trim().replace(/\s*,\s*(?:fl|florida)(?:\s*,\s*(?:usa|united states(?: of america)?))?$/i, '');
  const townWords = value => ` ${townName(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  function townMatches(stay, town) {
    if (!townName(town) || townWords(town)===' florida ') return true;
    const query = townWords(town);
    return query.trim() && [stay.area, stay.searchArea, stay.county].some(area => area && townWords(area).includes(query));
  }
  function dateMatches(stay, filter) {
    if (filter.window && filter.window !== 'all' && `${stay.dates?.checkIn}/${stay.dates?.checkOut}` !== filter.window) return false;
    if (!filter.checkIn && !filter.checkOut) return true;
    return stay.dates?.checkIn === filter.checkIn && stay.dates?.checkOut === filter.checkOut &&
      !['lead-undated-starting-price', 'published-rate-calculation-not-availability-quote'].includes(stay.priceStatus);
  }
  function budgetMatches(nightly, f) {
    if (Number.isFinite(f.minNight) && (!Number.isFinite(nightly) || nightly < f.minNight)) return false;
    if (f.under70 && (!Number.isFinite(nightly) || nightly > 70)) return false;
    if (Number.isFinite(f.maxNight) && (!Number.isFinite(nightly) || nightly > f.maxNight)) return false;
    return true;
  }
  function filter(stays, f = {}) {
    return stays.filter(s => {
      if (!dateMatches(s, f) || !townMatches(s, f.town)) return false;
      if (Number.isInteger(f.guests) && f.guests !== s.guests) return false;
      if (f.region && f.region !== 'all' && s.region !== f.region && globalThis.FloridaCore?.regionFor(s)!==f.region) return false;
      if (f.kind === 'private' && s.type !== 'private-room') return false;
      if (f.kind === 'entire' && !['entire-place', 'furnished-rv', 'tiny-home'].includes(s.type)) return false;
      if (f.kind === 'camping' && s.type !== 'campsite') return false;
      if (['primitive','no-facilities'].includes(f.kind))return false;
      return budgetMatches(s.nightly, f);
    }).sort((a, b) => (a.nightly ?? Infinity) - (b.nightly ?? Infinity) || a.name?.localeCompare(b.name || '') || 0);
  }
  function setSearch(url, params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value != null) url.searchParams.set(key, value);
    }
    return url.href;
  }
  function bookingLinks({town, checkIn, checkOut, guests, minNight, maxNight, areaCenter}) {
    town = townName(town);
    if (checkIn && checkOut && checkOut <= checkIn) return [];
    const statewide = !town || town.toLowerCase() === 'florida';
    const location = statewide ? 'Florida' : `${town}, Florida`;
    const slug = statewide ? 'Florida--United-States' : `${town.replace(/\s+/g, '-')}--Florida--United-States`;
    const adults = guests || 1;
    // ArcGIS world geocoder locality points, solely to center the provider's search.
    const [lat,lng] = areaCenter || (town.toLowerCase()==='stuart' ? [27.19957,-80.254878] : []);
    const air = new URL(`https://www.airbnb.com/s/${encodeURIComponent(slug)}/homes`);
    const vrbo = new URL('https://www.vrbo.com/search');
    const hip = new URL('https://www.hipcamp.com/en-US/search');
    return [
      {name: 'Airbnb', url: setSearch(air, {query:`${location}, United States`, search_mode:'regular_search', checkin: checkIn, checkout: checkOut, adults, price_min: minNight, price_max: maxNight, currency: 'USD'})},
      {name: 'Vrbo', url: setSearch(vrbo, {destination: `${location}, United States of America`, startDate: checkIn, endDate: checkOut, d1: checkIn, d2: checkOut, adults})},
      {name: 'Hipcamp', url: setSearch(hip, {q: location.replace(/, Florida$/, ', FL'), arrive: checkIn, depart: checkOut, adults, lat, lng})},
    ];
  }
  function caveat(s) {
    const text = JSON.stringify(s.conditions || {});
    const found = [];
    if (/no visitors|no guests|one guest maximum|1 guest max|one guest max|maximum (one|1) guest|visitors (are )?not (allowed|permitted)/i.test(text)) found.push('Limits on guests or visitors: check terms before planning company.');
    if (/no windows|windowless/i.test(text)) found.push('Windowless accommodation.');
    if (/toilet.{0,25}(broken|not working)|shared bathhouse/i.test(text)) found.push('Shared bathhouse or nonworking private toilet.');
    if (/second.floor|2nd.floor|stairs/i.test(text)) found.push('Stairs / upper-floor access described.');
    return found.join(' ');
  }
  globalThis.FloridaStays = { filter, caveat, townMatches, budgetMatches, bookingLinks };
}
