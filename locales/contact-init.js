// Load contact email from site-vars.json and inject into forms with data-dynamic-form
(function(){
  // Resolve absolute URL to site-vars.json based on the executing script
  var cfgPath = null;
  (function resolveCfgPath(){
    var s = document.currentScript;
    if(!s){
      var scripts = document.getElementsByTagName('script');
      for(var i=0;i<scripts.length;i++){
        var src = scripts[i].src || '';
        if(src.indexOf('contact-init.js') !== -1){ s = scripts[i]; break; }
      }
    }
    if(s && s.src){
      try{
        cfgPath = new URL('site-vars.json', s.src).href;
        return;
      }catch(e){ /* fall through to other heuristics */ }
    }
    // fallback: construct from location (assume '/SiteWebCottage/locales/site-vars.json' or similar)
    var p = location.pathname || '/';
    // if path already contains /locales/ use that
    var idx = p.indexOf('/locales/');
    if(idx !== -1){
      cfgPath = location.origin + p.substring(0, idx+('/locales'.length)) + '/site-vars.json';
      return;
    }
    // default: assume locales is next to root of repo
    cfgPath = location.origin + (p.endsWith('/') ? p + 'locales/site-vars.json' : p + '/locales/site-vars.json');
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

  fetch(cfgPath).then(r=>{
    if (!r.ok) throw new Error('site-vars.json fetch failed: '+r.status);
    return r.json();
  }).then(cfg=>{
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
