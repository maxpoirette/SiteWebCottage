// Load contact email from site-vars.json and inject into forms with data-dynamic-form
(function(){
  // Resolve absolute URL to site-vars.json based on the executing script
  var cfgPath = null;
  (function resolveCfgPath(){
    var candidates = [];
    var s = document.currentScript;
    if(!s){
      var scripts = document.getElementsByTagName('script');
      for(var i=0;i<scripts.length;i++){
        var src = scripts[i].src || '';
        if(src.indexOf('contact-init.js') !== -1){ s = scripts[i]; break; }
      }
    }
    try{
      if(s && s.src) candidates.push(new URL('site-vars.json', s.src).href);
    }catch(e){/* ignore */}

    // page-relative locales folder
    try{ candidates.push(new URL('./locales/site-vars.json', location.href).href); }catch(e){}

    // repo prefixed (first path segment), useful for GH Pages project sites
    try{
      var segs = location.pathname.split('/').filter(Boolean);
      if(segs.length>0){
        candidates.push(location.origin + '/' + segs[0] + '/locales/site-vars.json');
      }
    }catch(e){}

    // site root locales
    try{ candidates.push(location.origin + '/locales/site-vars.json'); }catch(e){}

    // remove duplicates
    candidates = candidates.filter(function(v,i){ return v && candidates.indexOf(v)===i; });
    cfgPath = candidates; // array to try sequentially
  })();
  // Attach submit-guard to forms to avoid accidental POST to the site (405 on GH Pages)
  const guardForms = () => {
    const forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(f=>{
      if (f.__contactGuardAttached) return;
      f.__contactGuardAttached = true;
      // mark as not yet injected
      f.dataset.contactInjected = 'false';
      f.addEventListener('submit', function(ev){
        if (f.dataset.contactInjected !== 'true'){
          ev.preventDefault();
          alert('Le formulaire n\'est pas prêt. Veuillez patienter quelques instants puis réessayer.');
        }
      });
    });
  };

  // initial guard attach (in case script runs before DOM fully ready)
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', guardForms);
  } else {
    guardForms();
  }

  // try candidates sequentially until one succeeds
  (function tryFetchList(list){
    if(!list || !list.length) return Promise.reject(new Error('no cfgPath candidates'));
    var url = list.shift();
    return fetch(url).then(r=>{
      if(!r.ok) return tryFetchList(list);
      return r.json().then(cfg=>({cfg:cfg,url:url}));
    }).catch(()=> tryFetchList(list));
  })(Array.isArray(cfgPath)? cfgPath.slice() : [cfgPath]).then(result=>{
    var cfg = result.cfg;
    // success
    const email = cfg.contact_email;
    if (!email) return;
    const forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(f=>{
      try{
        f.action = 'https://formsubmit.co/' + encodeURIComponent(email);
        f.dataset.contactInjected = 'true';
      }catch(e){
        console.error(e);
      }
    });
  }).catch(err=>{
    console.warn('Could not load site-vars.json for contact injection', err);
  });
})();
