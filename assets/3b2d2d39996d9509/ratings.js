'use strict';
{
  const root = globalThis;
  const providers = ['google', 'alltrails'];
  const names = { google: 'Google', alltrails: 'AllTrails' };
  const fields = ['rating', 'reviewCount', 'url', 'evidenceUrl', 'listingName', 'scope', 'scopeNote', 'checked', 'capture', 'evidenceText'];
  const https = value => URL.canParse(value) && new URL(value).protocol === 'https:';
  function validateSource(value, label) {
    if (value === null) return;
    if (!value || !Number.isFinite(value.rating) || value.rating < 1 || value.rating > 5) throw new Error(`Invalid rating: ${label}`);
    if (value.reviewCount !== null && (!Number.isInteger(value.reviewCount) || value.reviewCount < 0)) throw new Error(`Invalid review count: ${label}`);
    if (!https(value.url) || !https(value.evidenceUrl)) throw new Error(`Invalid rating URL: ${label}`);
    if (!['place', 'trail'].includes(value.scope) || !['direct', 'indexed', 'syndicated'].includes(value.capture)) throw new Error(`Invalid rating scope or capture: ${label}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.checked) || !value.listingName?.trim() || !value.evidenceText?.trim()) throw new Error(`Missing rating provenance: ${label}`);
  }
  function publicRatings(value) {
    if (!value) return null;
    const result = { unavailable: {} };
    for (const provider of providers) {
      const source = value[provider];
      result[provider] = source ? Object.fromEntries(fields.filter(key => source[key] !== undefined).map(key => [key, source[key]])) : null;
      result.unavailable[provider] = typeof value.unavailable?.[provider] === 'string' ? value.unavailable[provider] : null;
    }
    return result;
  }
  function summary(value) {
    if (!value) return null;
    const valid = providers.filter(key => Number.isFinite(value[key]?.rating) && value[key].rating >= 1 && value[key].rating <= 5);
    const place = valid.filter(key => value[key].scope === 'place');
    const listingKey = source => String(source?.listingName || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const sameNamedTrail = valid.length === 2 && valid.some(key => value[key].scope === 'trail') && listingKey(value.google) !== '' && listingKey(value.google) === listingKey(value.alltrails);
    const selected = sameNamedTrail ? valid : place.length ? place : valid.slice(0, 1);
    if (!selected.length) return null;
    const score = Math.round((selected.reduce((sum, key) => sum + value[key].rating, 0) / selected.length + Number.EPSILON) * 10) / 10;
    const kind = selected.length > 1 ? 'blend' : place.length ? 'single' : 'trail';
    return { score, kind, label: selected.map(key => names[key]).join(' + ') + (kind === 'trail' ? ' · trail' : ''), providers: selected };
  }
  function attach(places, records, { requireAll = true } = {}) {
    const known = new Set(places.map(p => p.id)), indexed = new Map();
    for (const record of records) {
      if (!known.has(record.placeId)) throw new Error(`Unknown rating place: ${record.placeId}`);
      if (indexed.has(record.placeId)) throw new Error(`Duplicate rating place: ${record.placeId}`);
      for (const provider of providers) {
        validateSource(record[provider], `${record.placeId}/${provider}`);
        if (record[provider] === null && !record.unavailable?.[provider]?.trim()) throw new Error(`Missing rating disposition: ${record.placeId}/${provider}`);
      }
      indexed.set(record.placeId, publicRatings(record));
    }
    const missing = places.filter(p => !indexed.has(p.id));
    if (requireAll && missing.length) throw new Error(`Missing rating research: ${missing.map(p => p.id).join(', ')}`);
    return places.map(p => ({ ...p, ratings: indexed.get(p.id) || null }));
  }
  const api = { summary, publicRatings, attach };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FloridaRatings = api;
}
