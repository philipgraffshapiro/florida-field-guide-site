"use strict";
// Each type has its own spatial index. Anchors always remain geographic.
function typedClusterLayer(target) {
  const groups=new Map();let pending=[],frame=0,densityFrame=0;
  const density=()=>{cancelAnimationFrame(densityFrame);densityFrame=requestAnimationFrame(()=>mapDensity(target,groups));};
  target.on('moveend zoomend resize',density);
  const flush=()=>{
    const batches=new Map();
    for(const marker of pending){
      const kind=marker.options.placeKind||'adventure';
      if(!batches.has(kind))batches.set(kind,[]);
      batches.get(kind).push(marker);
    }
    pending=[];
    for(const [kind,points] of batches){
      if(!groups.has(kind)){
        const group=L.markerClusterGroup({maxClusterRadius:72,showCoverageOnHover:false,
          animate:false,animateAddingMarkers:false,spiderfyOnMaxZoom:false,
          zoomToBoundsOnClick:false,removeOutsideVisibleBounds:true,iconCreateFunction:clusterIcon}).addTo(target);
        group.on('clusterclick',event=>{
          if(nearbyMapAction(event.layer,target))return;
          if(target.getZoom()<15)event.layer.zoomToBounds({padding:[35,35],maxZoom:target.getZoom()+2,animate:false});
          else openMapGroup(event.layer,target);
        });
        groups.set(kind,group);
      }
      groups.get(kind).addLayers(points);
    }
    density();
  };
  target.on('unload',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(densityFrame);target.off('moveend zoomend resize',density);});
  return {
    addLayer(marker){pending.push(marker);cancelAnimationFrame(frame);frame=requestAnimationFrame(flush);return this;},
    addLayers(points){pending.push(...points);cancelAnimationFrame(frame);flush();return this;},
    clearLayers(){cancelAnimationFrame(frame);pending=[];groups.forEach(group=>group.clearLayers());return this;},
    flush,groups
  };
}
function clusterTypes(cluster) {
  const types=new Map();
  cluster.getAllChildMarkers().forEach(marker=>{
    const kind=marker.options.placeKind||'adventure';
    if(!types.has(kind))types.set(kind,[]);
    types.get(kind).push(marker);
  });
  return [...types].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
}
function openMapGroup(cluster,target) {
  const dialog=$('map-group-dialog'),content=$('map-group-content');
  content.innerHTML=clusterTypes(cluster).map(([kind,points])=>`<section class="group-category"><h3>${pinGlyph(kind)}${esc(PIN_TYPES[kind][0])} <span>${points.length}</span></h3>${points.map(marker=>`<button class="group-place" data-group-place="${esc(marker.options.placeId||'')}" data-stay-area="${esc(marker.options.stayArea||'')}">${esc(marker.options.title)}</button>`).join('')}</section>`).join('');
  content.onclick=event=>{
    const b=event.target.closest('[data-group-place]');if(!b)return;
    dialog.close();if(b.dataset.stayArea)openStayArea(b.dataset.stayArea);else openPlace(b.dataset.groupPlace);
  };
  $('zoom-map-group').onclick=()=>{dialog.close();target.fitBounds(cluster.getBounds(),{padding:[45,45],maxZoom:17,animate:false});};
  dialog.showModal();
}
