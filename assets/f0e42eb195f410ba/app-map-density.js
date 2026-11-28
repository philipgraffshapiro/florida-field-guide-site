"use strict";
// Keep touch targets separate at their geographic anchors. A crowded spot
// uses one existing marker to reach every group represented there.
const MAP_MARKER_SIZE = 44;
const MAP_MARKER_SPACING = MAP_MARKER_SIZE + 2;
function watchMapDensity(target,groups) {
  const container=target.getContainer();
  let frame=0;
  const density=()=>{
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      const controls=mapMarkerObstacles(container);
      controls.forEach(control=>controlSizes.observe(control));
      mapDensity(target,groups,controls);
    });
  };
  const controlSizes=new ResizeObserver(density);
  target.on('moveend zoomend resize',density);
  target.once('unload',()=>{
    cancelAnimationFrame(frame);
    controlSizes.disconnect();
    target.off('moveend zoomend resize',density);
  });
  return density;
}
function mapMarkerObstacles(container) {
  const wrap=container.closest('.map-wrap');
  const overlays=wrap?.querySelectorAll('.map-tools, .map-error, .map-result-bar')||[];
  const sheet=container.closest('.atlas')?.querySelector('.place-list');
  return [...container.querySelectorAll('.leaflet-control'),...overlays,...(sheet?[sheet]:[])];
}
function markerHasRoom(point,size,obstacles) {
  const half=MAP_MARKER_SIZE/2;
  const left=point.x-half,right=point.x+half,top=point.y-half,bottom=point.y+half;
  if(left<0||top<0||right>size.x||bottom>size.y)return false;
  return !obstacles.some(rect=>left<rect.right&&rect.left<right&&top<rect.bottom&&rect.top<bottom);
}
function mapDensity(target,groups,controls) {
  const shown=new Set(),size=target.getSize();
  const mapRect=target.getContainer().getBoundingClientRect();
  const obstacles=controls.map(el=>el.getBoundingClientRect()).filter(rect=>rect.width&&rect.height)
    .map(rect=>({left:rect.left-mapRect.left,right:rect.right-mapRect.left,top:rect.top-mapRect.top,bottom:rect.bottom-mapRect.top}));
  groups.forEach(group=>group.eachLayer(marker=>{
    const visible=group.getVisibleParent(marker);
    if(visible?.getElement())shown.add(visible);
  }));
  const entries=[...shown].map(marker=>({marker,point:target.latLngToContainerPoint(marker.getLatLng())}))
    .sort((a,b)=>(b.marker.getChildCount?.()||1)-(a.marker.getChildCount?.()||1));
  const cells=new Map();
  for(const entry of entries){
    const {marker,point}=entry,el=marker.getElement();
    marker.nearbyMapMarkers=null;
    if(!markerHasRoom(point,size,obstacles)){el.style.visibility='hidden';continue;}
    const x=Math.floor(point.x/MAP_MARKER_SPACING),y=Math.floor(point.y/MAP_MARKER_SPACING);
    const neighbor=nearbyMapEntry(cells,x,y,point);
    if(neighbor){
      neighbor.marker.nearbyMapMarkers.push(marker);el.style.visibility='hidden';
    }else{
      marker.nearbyMapMarkers=[marker];
      el.style.visibility='';
      if(!cells.has(`${x},${y}`))cells.set(`${x},${y}`,[]);
      cells.get(`${x},${y}`).push(entry);
    }
  }
  for(const {marker} of entries){
    const el=marker.getElement();
    const nearby=(marker.nearbyMapMarkers?.length||0)>1;
    el.classList.toggle('nearby-map-dot',nearby);
    if(marker.nearbyMapMarkers)el.setAttribute('aria-label',mapMarkerLabel(marker,target.getZoom(),nearby));
  }
}
function nearbyMapEntry(cells,x,y,point) {
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    const hit=cells.get(`${x+dx},${y+dy}`)?.find(e=>Math.abs(e.point.x-point.x)<MAP_MARKER_SPACING&&Math.abs(e.point.y-point.y)<MAP_MARKER_SPACING);
    if(hit)return hit;
  }
}
function nearbyMapAction(marker,target) {
  if(!marker.nearbyMapMarkers||marker.nearbyMapMarkers.length<2)return false;
  const children=[...new Set(marker.nearbyMapMarkers.flatMap(m=>m.getAllChildMarkers?m.getAllChildMarkers():[m]))];
  if(target.getZoom()>=16){openMapGroup({getAllChildMarkers:()=>children,getBounds:()=>L.latLngBounds(children.map(m=>m.getLatLng()))},target);return true;}
  const bounds=L.latLngBounds(children.map(m=>m.getLatLng()));
  const zoom=Math.max(target.getZoom()+1,Math.min(target.getZoom()+2,target.getBoundsZoom(bounds,false,L.point(60,60))));
  target.setView(bounds.getCenter(),Math.min(16,zoom),{animate:false});return true;
}
