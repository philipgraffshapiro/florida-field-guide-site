"use strict";
const siteEntry=document.currentScript;
const siteAssetBase=new URL('.',siteEntry.src);

async function fetchSiteCatalog() {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try {
    const response=await fetch(siteEntry.dataset.catalog,{signal:controller.signal});
    if(!response.ok)throw new Error(`Catalog request failed: ${response.status}`);
    const data=await response.json();
    if(data.version!==1||data.shared!==true||!Array.isArray(data.places)||!Array.isArray(data.stays))throw new Error('Invalid guide catalog.');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function loadSiteScript(name) {
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.async=false;
    script.src=new URL(name,siteAssetBase).href;
    const timer=setTimeout(()=>reject(new Error(`Script request timed out: ${name}`)),15000);
    script.onload=()=>{clearTimeout(timer);resolve();};
    script.onerror=()=>{clearTimeout(timer);reject(new Error(`Script request failed: ${name}`));};
    document.head.append(script);
  });
}

async function startWebsite() {
  globalThis.FLORIDA_DATA=await fetchSiteCatalog();
  const files=siteEntry.dataset.scripts.split(' ');
  await Promise.all(files.map(loadSiteScript));
  if(!globalThis.FieldGuide?.map)throw new Error('Guide initialization did not finish.');
  document.querySelector('.shell').inert=false;
  document.getElementById('site-status').remove();
}

startWebsite().catch(error=>{
  console.error('Florida guide failed to start.',error);
  document.getElementById('site-loading-message').textContent='The guide could not load. Reload to try again.';
  document.getElementById('site-retry').hidden=false;
});
