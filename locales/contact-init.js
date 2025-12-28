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
  var repoFallback = (location.origin + '/SiteWebCottage/locales/site-vars.json');

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
      }catch(e){ console.error(e); }
    });
    console.debug('contact-init: applied email to', forms.length, 'forms');
    return true;
  }

  fetch(cfgUrl).then(function(r){
    if(!r.ok) throw new Error('site-vars.json fetch failed: '+r.status);
    return r.json();
  }).then(function(cfg){
    var email = cfg && cfg.contact_email;
    if(email) return applyEmailToForms(email);
    throw new Error('no contact_email in site-vars.json');
  }).catch(function(err){
    console.warn('contact-init: primary fetch failed:', err);
    // try repo-root fallback
    fetch(repoFallback, {cache:'no-cache'}).then(function(r){
      if(!r.ok) throw new Error('repo fallback fetch failed: '+r.status);
      return r.json();
    }).then(function(cfg){
      var email = cfg && cfg.contact_email;
      if(email) return applyEmailToForms(email);
      throw new Error('no contact_email in repo fallback');
    }).catch(function(err2){
      console.warn('contact-init: repo fallback failed:', err2);
      // last resort: try global injected variable from index.html
      try{
        var g = window.__SITE_VARS_GLOBAL__;
        if(g && g.contact_email){
          applyEmailToForms(g.contact_email);
          return;
        }
      }catch(e){}
      console.warn('contact-init: no contact email available — forms will remain inactive until config is reachable.');
    });
  });
})();
