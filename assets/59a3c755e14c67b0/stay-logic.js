(function (root) {
  'use strict';
  function filter(stays, f = {}) {
    return stays.filter(s => {
      if (f.window && f.window !== 'all' && `${s.dates?.checkIn}/${s.dates?.checkOut}` !== f.window) return false;
      if (f.region && f.region !== 'all' && s.region !== f.region && root.FloridaCore?.regionFor(s)!==f.region) return false;
      if (f.kind === 'private' && s.type !== 'private-room') return false;
      if (f.kind === 'entire' && !['entire-place', 'furnished-rv', 'tiny-home'].includes(s.type)) return false;
      if (f.kind === 'camping' && s.type !== 'campsite') return false;
      if (['primitive','no-facilities'].includes(f.kind))return false;
      if (Number.isFinite(f.minNight) && (!Number.isFinite(s.nightly) || s.nightly < f.minNight)) return false;
      if (f.under70 && (!Number.isFinite(s.nightly) || s.nightly > 70)) return false;
      if (Number.isFinite(f.maxNight) && (!Number.isFinite(s.nightly) || s.nightly > f.maxNight)) return false;
      return true;
    }).sort((a, b) => (a.nightly ?? Infinity) - (b.nightly ?? Infinity) || a.name?.localeCompare(b.name || '') || 0);
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
  root.FloridaStays = { filter, caveat };
})(globalThis);
