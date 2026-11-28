"use strict";
// Camping: card tags, the detail section for campsite records, and the free/paid control
// that appears in the filter sheet while the Camping category is chosen.
const CAMP_KINDS = { federal: 'Federal overnight facility', dispersed: 'Dispersed: roadside, no facilities', primitive: 'Primitive campsite', 'hunt-camp': 'Hunt camp', developed: 'Developed campground', 'private-land': 'Private land' };
const CAMP_ROADS = { paved: 'Paved to the site', 'graded-ok': 'Graded road, fine for a sedan', 'soft-sand-risk': 'Soft sand: risky in a low sedan', unknown: 'Road condition not confirmed' };
const CAMP_BOOKING = { none: 'No reservation', 'free-permit': 'Free permit or reservation required', 'paid-booking': 'Paid booking', 'first-come': 'First come, first served' };
const CAMP_CAR = { allowed: 'Sleeping in the car is allowed', 'not-allowed': 'Sleeping in the car is not allowed', unclear: 'Car-sleeping rule not confirmed' };

function campPrice(camp) {
  if (camp.free === true) return 'Free';
  if (!Number.isFinite(camp.nightly)) return 'Price not confirmed';
  return (camp.fromRate ? 'From $' : '$') + camp.nightly + ' / night';
}
function campTags(p) {
  const camp = p.camp;
  if (!camp) return [];
  return [campPrice(camp), camp.showers === true ? 'Showers' : '', camp.power === true ? 'Power' : '', camp.sedanAccess === 'soft-sand-risk' ? 'Soft sand road' : ''].filter(Boolean);
}
function campYesNo(value) { return value === true ? 'Yes' : value === false ? 'No' : 'Not confirmed'; }
function campRow(label, value) { return value ? `<div class="camp-fact"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : ''; }
function campBody(p) {
  const camp = p.camp;
  const facilities = `Showers ${campYesNo(camp.showers)} · Power ${campYesNo(camp.power)} · Toilets ${campYesNo(camp.toilets)} · Water ${campYesNo(camp.water)}`;
  return '<dl class="camp-facts">' + [
    campRow('Cost', campPrice(camp)+(camp.fromRate && Number.isFinite(camp.nightly)?' · lowest archived base rate across site types. See the exact site for equipment and price.':'')),
    campRow('Type', CAMP_KINDS[camp.kind]),
    campRow('Booking', CAMP_BOOKING[camp.reservation] || 'Check the official booking page'),
    campRow('Booking cutoff', camp.bookingCutoff || 'Unknown. Check the operator for same-day booking.'),
    campRow('Posted entrance gate hours', camp.gateHours || 'Unknown'),
    campRow('After-hours vehicle access', camp.lateArrival || 'Entry and early departure arrangements unconfirmed. Contact the operator before arrival.'),
    campRow('Directions', camp.directions || p.navigationAddress || p.navigationDestination || 'Entrance directions unconfirmed'),
    campRow('Equipment and vehicle rules', camp.vehicleEquipment || 'Check the rules for the specific site and equipment.'),
    campRow('Shower access', camp.showerAccess || (camp.showers===false?'No shower listed':'Access and hot water unconfirmed')),
    campRow('Facilities', facilities),
    campRow('Road', [CAMP_ROADS[camp.sedanAccess], camp.sedanNote].filter(Boolean).join('. ')),
    campRow('Car sleeping', [CAMP_CAR[camp.carSleeping], camp.carSleepingNote].filter(Boolean).join('. ')),
    campRow('Stay limit', camp.stayLimit),
    campRow('Hunting season', camp.huntingNote),
  ].join('') + '</dl>' + (camp.reservationUrl ? link(camp.reservationUrl, 'Reserve or get the permit ↗', 'outline') : '');
}
// Camping cost narrows campsite pins without excluding other enabled types.
function campCostChoice() { return enabledMapTypes.has('camp') ? $('camp-cost').value : 'all'; }
function syncCampCost() {
  $('camp-cost-row').hidden = !enabledMapTypes.has('camp');
}
