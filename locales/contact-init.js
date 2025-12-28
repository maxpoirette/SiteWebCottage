// Simple contact injector for static site
(function(){
  // resolve base URL from script src (works both when script is loaded from /locales/ and when injected)
  var s = document.currentScript;
  if(!s){
    var scripts = document.getElementsByTagName('script');
    for(var i=0;i<scripts.length;i++){
      var src = scripts[i].src || '';
      if(src.indexOf('contact-init.js') !== -1){ s = scripts[i]; break; }
    }
  }
  var base;
  try{
    base = s && s.src ? new URL('.', s.src).href : (location.origin + (location.pathname.endsWith('/') ? location.pathname + 'locales/' : '/locales/'));
  }catch(e){
    base = location.origin + '/locales/';
  }
  var cfgUrl = new URL('site-vars.json', base).href;

  // attach guard to prevent submit before injection
  function guardForms(){
    var forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(function(f){
      if(f.__contactGuardAttached) return;
      f.__contactGuardAttached = true;
      f.dataset.contactInjected = 'false';
      f.addEventListener('submit', function(ev){
        if(f.dataset.contactInjected !== 'true'){
          ev.preventDefault();
          alert('Le formulaire n\'est pas prêt. Veuillez patienter quelques instants puis réessayer.');
        }
      });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', guardForms); else guardForms();

  // Try to fetch config, with fallbacks and verbose logging to ease debugging on GH Pages
  function applyEmailToForms(email){
    if(!email) return false;
    var forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(function(f){
      try{
        f.action = 'https://formsubmit.co/' + encodeURIComponent(email);
        f.dataset.contactInjected = 'true';
      }catch(e){}
    });
    return true;
  }

  // Convert relative _next values (e.g. "/locales/merci_fr.html") into absolute URLs
  // based on the current origin + inferred site base so FormSubmit redirects back
  // to the correct domain (works both on GitHub Pages and on a custom domain).
  function absolutizeNexts(){
    function siteBase(){
      var p = location.pathname || '/';
      var idx = p.indexOf('/locales/');
      if(idx !== -1){
        return location.origin + p.slice(0, idx) + '/';
      }
      // if path ends with a filename, strip it
      if(/\.html$/.test(p)){
        return location.origin + p.substring(0, p.lastIndexOf('/') + 1);
      }
      return location.origin + (p.endsWith('/') ? p : p + '/');
    }

    var base = siteBase();
    var forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(function(f){
      try{
        var inp = f.querySelector('input[name="_next"]');
        if(inp && inp.value && inp.value.charAt(0) === '/'){
          // remove leading slashes from input value before joining
          var rel = inp.value.replace(/^\/+/, '');
          inp.value = base + rel;
        }
      }catch(e){}
    });
  }

  fetch(cfgUrl).then(function(r){
    if(!r.ok) throw new Error('site-vars.json fetch failed: '+r.status);
    return r.json();
  }).then(function(cfg){
    var email = cfg && cfg.contact_email;
    if(email) applyEmailToForms(email);
    // once email applied, ensure _next values are absolute so FormSubmit redirects back
    try{ absolutizeNexts(); }catch(e){}
  }).catch(function(){
    // fallback: try global variable if present (kept for backwards-compatibility)
    try{
      var g = window.__SITE_VARS_GLOBAL__;
      if(g && g.contact_email) applyEmailToForms(g.contact_email);
      try{ absolutizeNexts(); }catch(e){}
    }catch(e){}
  });
})();
