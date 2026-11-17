"use strict";
// Crowded labels become one small dot at an existing geographic anchor.
// A tap zooms to those nearby groups; it never invents a combined category count.
function mapDensity(target,groups) {
  const shown=new Set(),size=target.getSize();
  groups.forEach(group=>group.eachLayer(marker=>{
    const visible=group.getVisibleParent(marker);
    if(visible?.getElement())shown.add(visible);
  }));
  const entries=[...shown].map(marker=>({marker,point:target.latLngToContainerPoint(marker.getLatLng())}))
    .sort((a,b)=>(b.marker.getChildCount?.()||1)-(a.marker.getChildCount?.()||1));
  const cells=new Map();
  for(const entry of entries){
    const {marker,point}=entry,el=marker.getElement();
    marker.nearbyMapMarkers=null;el.classList.remove('nearby-map-dot');el.style.visibility='';
    if(point.x<0||point.y<0||point.x>size.x||point.y>size.y){el.style.visibility='hidden';continue;}
    const x=Math.floor(point.x/36),y=Math.floor(point.y/36);
    const neighbor=nearbyMapEntry(cells,x,y,point);
    if(neighbor){
      neighbor.marker.nearbyMapMarkers.push(marker);el.style.visibility='hidden';
      neighbor.marker.getElement().classList.add('nearby-map-dot');
    }else{
      marker.nearbyMapMarkers=[marker];
      if(!cells.has(`${x},${y}`))cells.set(`${x},${y}`,[]);
      cells.get(`${x},${y}`).push(entry);
    }
  }
}
function nearbyMapEntry(cells,x,y,point) {
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    const hit=cells.get(`${x+dx},${y+dy}`)?.find(e=>Math.abs(e.point.x-point.x)<34&&Math.abs(e.point.y-point.y)<34);
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
