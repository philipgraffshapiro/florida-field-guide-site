"use strict";
'use strict';
{
  const C=globalThis.FloridaCore;
  function durationHours(p){
    const text=p.duration || '';
    const range=text.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*(hours?|minutes?)/i);
    if(range)return Number(range[2]) / (/minute/i.test(range[3])?60:1);
    if(/half(?: a)?[- ]day/i.test(text))return 4;
    if(/full[- ]day/i.test(text))return 8;
    const single=text.match(/(\d+(?:\.\d+)?)\s*(hours?|minutes?)/i);
    return single?Number(single[1])/(/minute/i.test(single[2])?60:1):null;
  }
  function hoursIssue(p,ctx) {
    const h=p.outingHours;
    if(!h)return '';
    if(h.months&&!h.months.includes(Number(ctx.date?.slice(5,7))))return '';
    if(ctx.arrival && (ctx.arrival<h.from || ctx.arrival>=h.to))return 'Arrival outside posted '+h.from+'–'+h.to+' window';
    if(h.days && ctx.date && !h.days.includes(new Date(ctx.date+'T12:00:00Z').getUTCDay()))return 'Normally closed on this weekday; check federal-holiday exceptions';
    return '';
  }
  function routeMiles(p,ctx) {
    const point=[p.lat,p.lng];
    if(ctx.route?.start && ctx.route?.end && !ctx.base){
      const a=C.distanceMiles(ctx.route.start,point), b=C.distanceMiles(point,ctx.route.end);
      return a===null||b===null?null:Math.max(0,a+b-C.distanceMiles(ctx.route.start,ctx.route.end));
    }
    return C.distanceMiles(ctx.base||ctx.route?.end,point);
  }
  function weatherFit(categories,weather) {
    if(weather==='gray') return categories.includes('wildlife');
    if(weather!=='sun') return false;
    return categories.includes('snorkel') || categories.includes('spring') && categories.some(c=>['swim','paddle','dive'].includes(c));
  }
  function fitRow(p,ctx={},picks={}) {
    const v=C.visitFor(p,picks),choice=picks[p.id],restriction=C.activeRestrictions(p,ctx)[0];
    const unavailable=p.conditions?.status==='closed'||Boolean(restriction)||p.navigationBlocked;
    const canRevisit=v.revisit && (!v.revisitActivities?.length || !ctx.category || ['all','spring','beach'].includes(ctx.category) || v.revisitActivities.includes(ctx.category));
    const done=v.status==='done'&&!canRevisit;
    const parkDone=p.id.startsWith('paynes-prairie-') && picks['paynes-prairie-preserve']?.visit?.status==='done';
    const hours=hoursIssue(p,ctx), duration=durationHours(p);
    const limit={short:2,half:4}[ctx.window],tooLong=limit && duration!==null && duration>limit;
    const weatherMatch=weatherFit(p.categories,ctx.weather);
    const preferred=ctx.plan?.sunnyPlaces?.includes(p.id) && ctx.weather==='sun';
    const prior=choice?.review?.stars || 0;
    const miles=routeMiles(p,ctx);
    const daysOld=p.conditions?.checked&&ctx.date?(Date.parse(ctx.date)-Date.parse(p.conditions.checked))/86400000:Infinity;
    const tripDate=choice?.day && choice.day===ctx.date;
    const publicStars=globalThis.FloridaRatings?.summary(p.ratings)?.score || 0;
    return {v,restriction,unavailable,done,canRevisit,parkDone,hours,duration,tooLong,limit,weatherMatch,preferred,prior,miles,tripDate,daysOld,
      rank:[Number(Boolean(unavailable || hours || ctx.plan?.excludedPlaces?.includes(p.id))),Number(done || parkDone&&!canRevisit || choice?.pick==='no'),Number(Boolean(tooLong)),tripDate?-1:0,
        preferred?-1:0,weatherMatch?-1:0,canRevisit?-1:0,choice?.pick==='yes'?-1:0,prior>0&&prior<=2?1:0,
        miles===null?999:Math.floor(miles/25),p.priority??4,daysOld>30?1:0,prior?-prior:0,-publicStars,p.order??999]};
  }
  function compareRows(a,b){
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];
    return 0;
  }
  function fitExplanation(p,ctx={},picks={}){
    const f=fitRow(p,ctx,picks), parts=[];
    if(f.restriction)parts.push(f.restriction.activities.join('/')+' '+f.restriction.status.replaceAll('-',' ')+(f.restriction.reportDate?' · reported '+f.restriction.reportDate:''));
    else if(p.conditions?.status==='closed')parts.push('Reported closure');
    else if(p.navigationBlocked)parts.push('Meeting point or public access unconfirmed');
    if(f.hours)parts.push(f.hours);
    else if(ctx.arrival&&!p.outingHours)parts.push('Arrival cutoff unconfirmed');
    if(f.canRevisit)parts.push('Requested revisit'+(f.v.activity?' · '+f.v.activity:''));
    else if(f.done)parts.push('Completed'+(f.v.date?' '+f.v.date:'')+' · kept in alternatives');
    else if(f.parkDone)parts.push('Park completed · this particular trail is unconfirmed');
    if(picks[p.id]?.pick==='no')parts.push('Previously passed');
    if(f.tripDate)parts.push('Saved for '+ctx.date);
    if(ctx.plan?.activityNotes?.[p.id])parts.push(ctx.plan.activityNotes[p.id]);
    if(f.preferred)parts.push('Saved sunny-day outing');
    else if(f.weatherMatch)parts.push(ctx.weather==='sun'?'Water outing for a sunny day; clarity unverified':'Wildlife option for an overcast day');
    if(f.limit)parts.push(f.duration===null?'Duration unconfirmed':(f.tooLong?'Longer than the chosen window':'Fits the chosen outing window')+' (allow up to '+f.duration+' h)');
    if(f.prior)parts.push('Your review '+f.prior+'/5');
    if(f.miles!==null)parts.push(Math.round(f.miles)+' mi '+(ctx.route?.start && ctx.route?.end && !ctx.base?'extra straight-line distance along the trip':'straight-line from starting area'));
    if(!parts.length)parts.push('Guide priority '+(p.priority??'unrated'));
    parts.push('Access checked '+(p.conditions?.checked||'date unknown'));
    return parts.join(' · ');
  }
  C.fitRow=fitRow;
  C.compareFitRows=compareRows;
  C.compareFit=(a,b,ctx,picks)=>compareRows(fitRow(a,ctx,picks).rank,fitRow(b,ctx,picks).rank)||a.name.localeCompare(b.name);
  C.fitExplanation=fitExplanation;
}
