"use strict";
{
  const entry=document.currentScript;
  const assetBase=new URL('.',entry.src);
  const pageUrl=new URL(location.href);
  const retryKey='load-retry';
  const retryToken=pageUrl.searchParams.get(retryKey);
  const loadedScripts=new Map();
  const waitLimit=15000;

  function requestUrl(name,base) {
    const url=new URL(name,base);
    if(retryToken)url.searchParams.set(retryKey,retryToken);
    return url.href;
  }

  async function fetchCatalog(name,priority='auto') {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),waitLimit);
    try {
      const response=await fetch(requestUrl(name,document.baseURI),{signal:controller.signal,priority});
      if(!response.ok)throw new Error(`Catalog request failed: ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function loadScript(name) {
    if(loadedScripts.has(name))return loadedScripts.get(name);
    const request=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.async=false;
      script.src=requestUrl(name,assetBase);
      script.onload=resolve;
      script.onerror=()=>{
        loadedScripts.delete(name);
        script.remove();
        reject(new Error(`Script request failed: ${name}`));
      };
      document.head.append(script);
    });
    loadedScripts.set(name,request);
    return request;
  }

  async function loadScripts(names) {
    let timer;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('The script download timed out.')),waitLimit);});
    try {
      await Promise.race([Promise.all(names.split(' ').map(loadScript)),deadline]);
    } finally {
      clearTimeout(timer);
    }
  }

  function detailIndex(places,files) {
    const placesByFile=files.map(()=>[]);
    const fileByPlace=new Map();
    places.forEach((place,index)=>{
      const file=index%files.length;
      placesByFile[file].push(place);
      fileByPlace.set(place.id,file);
    });
    return {placesByFile,fileByPlace};
  }

  async function hydratePlaces(name,places,priority) {
    const rows=await fetchCatalog(name,priority);
    if(!Array.isArray(rows)||rows.length!==places.length||rows.some((row,i)=>row?.id!==places[i].id)){
      throw new Error('The place details did not match this guide.');
    }
    // Keep the same objects shared by markers, filters and selected cards.
    rows.forEach((row,i)=>Object.assign(places[i],row));
  }

  function createPlaceLoader(places,files) {
    const {placesByFile,fileByPlace}=detailIndex(places,files);
    const requests=new Map();
    const ready=new Set();
    function loadDetailFile(file,priority) {
      if(!requests.has(file))requests.set(file,hydratePlaces(files[file],placesByFile[file],priority)
        .then(()=>ready.add(file)).catch(error=>{requests.delete(file);throw error;}));
      return requests.get(file);
    }
    return {
      hasPlace: id=>ready.has(fileByPlace.get(id)),
      loadPlace(id) {
        const file=fileByPlace.get(id);
        return file===undefined||ready.has(file)?null:loadDetailFile(file,'high');
      },
      loadAllPlaces: ()=>Promise.all(files.map((_,file)=>loadDetailFile(file)))
    };
  }

  async function hydratePanels(data) {
    const [panels]=await Promise.all([fetchCatalog(entry.dataset.panels),loadScripts(entry.dataset.panelScripts)]);
    const panelKeys=['stays','loops','branches'];
    if(!panels||panelKeys.some(key=>!Array.isArray(panels[key])))throw new Error('Invalid guide panels.');
    for(const key of panelKeys)data[key]=panels[key];
  }

  function createCatalogLoader(data) {
    const {hasPlace,loadPlace,loadAllPlaces}=createPlaceLoader(data.places,entry.dataset.details.split(' '));
    let panelsRequest,panelsReady=false;
    function loadPanels() {
      if(!panelsRequest)panelsRequest=hydratePanels(data).then(()=>{panelsReady=true;})
        .catch(error=>{panelsRequest=null;throw error;});
      return panelsRequest;
    }
    return {
      hasPlace,loadPlace,loadPanels,
      get panelsReady(){return panelsReady;},
      async loadCatalog() {
        await Promise.all([loadPanels(),loadAllPlaces()]);
        return data;
      }
    };
  }

  async function startWebsite() {
    const [data]=await Promise.all([fetchCatalog(entry.dataset.catalog),loadScripts(entry.dataset.mapScripts)]);
    if(!data||data.version!==1||data.shared!==true||!Array.isArray(data.places)||!data.places.length)throw new Error('Invalid guide catalog.');
    globalThis.FLORIDA_ASSET_BASE=assetBase;
    globalThis.FLORIDA_DATA=data;
    globalThis.FloridaSiteData=createCatalogLoader(data);
    await loadScripts(entry.dataset.scripts);
    if(!globalThis.FieldGuide?.map)throw new Error('Guide initialization did not finish.');
    document.querySelector('.shell').inert=false;
    document.getElementById('site-status').remove();
    if(retryToken){pageUrl.searchParams.delete(retryKey);history.replaceState(history.state,'',pageUrl.href);}
  }

  startWebsite().catch(error=>{
    console.error('Florida guide failed to start.',error);
    document.getElementById('site-loading-message').textContent='The guide could not load. Reload to try again.';
    const retry=document.getElementById('site-retry');
    // WebKit can keep a failed preload in its memory cache across navigation.
    pageUrl.searchParams.set(retryKey,Date.now().toString(36));
    retry.href=pageUrl.href;
    retry.hidden=false;
  });
}
