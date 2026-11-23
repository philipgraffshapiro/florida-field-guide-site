"use strict";
function ownReview(p) {return pick(p.id).review||{stars:0,date:visit(p).date,time:'',text:'',updated:0};}
function reviewEditor(p) {
  const r=ownReview(p);
  return `<section class="my-review"><h3>My review</h3><div class="review-stars" role="group" aria-label="My star rating">${[1,2,3,4,5].map(n=>`<button type="button" data-review-stars="${n}" aria-label="${n} ${n===1?'star':'stars'}" aria-pressed="${r.stars===n}" class="${n<=r.stars?'filled':''}">★</button>`).join('')}</div><button type="button" class="text-button" id="clear-review-rating">Clear rating</button><div class="review-dates"><label>Visit date<input id="review-date" type="date" value="${esc(r.date)}"></label><label>Time<input id="review-time" type="time" value="${esc(r.time)}"></label></div><label>Your review<textarea id="review-text" maxlength="10000" placeholder="What did you think?">${esc(r.text)}</textarea></label><button id="save-review" class="primary" data-id="${esc(p.id)}">Save my review</button><p id="review-status" role="status"></p></section>`;
}
function reviewSummary(p) {
  const r=ownReview(p);
  if(!r.updated&&!r.text&&!r.stars)return '';
  return `<div class="own-review-summary">${r.stars?`<span aria-label="My rating: ${r.stars} out of 5">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span>`:'<span>Not rated yet</span>'}<small>${esc([r.date?visitDate(r.date):'',r.time].filter(Boolean).join(' · '))}</small>${r.text?`<p>${esc(r.text)}</p>`:''}</div>`;
}
function setReviewStars(value) {
  document.querySelectorAll('[data-review-stars]').forEach(b=>{
    const n=Number(b.dataset.reviewStars);b.classList.toggle('filled',n<=value);b.setAttribute('aria-pressed',String(n===value));
  });
}
function saveReview(id) {
  const p=byId.get(id);if(!p)return;
  const date=$('review-date'),time=$('review-time');
  if(!date.reportValidity()||!time.reportValidity())return;
  const chosen=document.querySelector('[data-review-stars][aria-pressed="true"]');
  const review={stars:Number(chosen?.dataset.reviewStars||0),date:date.value,time:time.value,text:$('review-text').value,updated:Date.now()};
  picks[id]={...pick(id),review,visit:{status:'done',date:review.date,updated:review.updated}};
  const saved=persist();renderSaved();
  $('review-status').textContent=saved.ok?'Review saved.':'Kept for this visit. Export your picks to keep it.';
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-review-stars'))setReviewStars(Number(b.dataset.reviewStars));
  if(b.id==='clear-review-rating')setReviewStars(0);
  if(b.id==='save-review')saveReview(b.dataset.id);
});
