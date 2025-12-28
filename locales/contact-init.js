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

  // Create a simple modal to show a thank-you popup
  function ensureThankYouModal(){
    if(document.getElementById('contact-thanks-modal')) return;
    var css = document.createElement('style');
    css.textContent = '\n#contact-thanks-modal{position:fixed;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);z-index:9999}\n#contact-thanks-modal .box{background:#fff;padding:1.5rem;border-radius:8px;max-width:480px;width:90%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2)}\n#contact-thanks-modal .close{margin-top:1rem;background:#2d7a4f;color:#fff;border:none;padding:0.6rem 1rem;border-radius:6px;cursor:pointer}\n';
    document.head.appendChild(css);
    var modal = document.createElement('div');
    modal.id = 'contact-thanks-modal';
    modal.style.display = 'none';
    modal.innerHTML = '<div class="box"><h2>Merci !</h2><p>Votre message a bien été envoyé — nous vous répondrons bientôt.</p><button class="close">Fermer</button></div>';
    document.body.appendChild(modal);
    modal.querySelector('.close').addEventListener('click', function(){ modal.style.display='none'; });
  }

  // Submit forms into a hidden iframe so the main page doesn't navigate,
  // then show the modal when the iframe loads the FormSubmit response.
  function attachHiddenIframeSubmit(){
    ensureThankYouModal();
    var forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(function(f, idx){
      try{
        var name = 'contact_iframe_' + idx;
        // create iframe if not exists
        if(!document.querySelector('iframe[name="'+name+'"]')){
          var ifr = document.createElement('iframe');
          ifr.name = name;
          ifr.style.display = 'none';
          document.body.appendChild(ifr);
          // when iframe loads, show modal
          ifr.addEventListener('load', function(){
            var modal = document.getElementById('contact-thanks-modal');
            if(modal) modal.style.display = 'flex';
          });
        }
        f.target = name;
        // ensure submit uses the iframe: prevent default and submit via a temporary form targeted at iframe
        if(!f.__contactSubmitHijacked){
          f.__contactSubmitHijacked = true;
          f.addEventListener('submit', function(ev){
            try{
              ev.preventDefault();
              // build a temporary form to submit to the iframe (helps avoid navigation)
              var tmp = document.createElement('form');
              tmp.style.display = 'none';
              tmp.method = (f.method || 'POST');
              tmp.action = f.action;
              tmp.target = name;
              // copy inputs
              var elements = f.querySelectorAll('input,textarea,select');
              elements.forEach(function(el){
                if(!el.name) return;
                var i = document.createElement('input');
                i.type = 'hidden';
                i.name = el.name;
                i.value = el.value || '';
                tmp.appendChild(i);
              });
              document.body.appendChild(tmp);
              tmp.submit();
              // remove tmp after short delay
              setTimeout(function(){ try{ document.body.removeChild(tmp); }catch(e){} }, 2000);
            }catch(e){}
          });
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
    try{ attachHiddenIframeSubmit(); }catch(e){}
  }).catch(function(){
    // fallback: try global variable if present (kept for backwards-compatibility)
    try{
      var g = window.__SITE_VARS_GLOBAL__;
      if(g && g.contact_email) applyEmailToForms(g.contact_email);
      try{ absolutizeNexts(); }catch(e){}
      try{ attachHiddenIframeSubmit(); }catch(e){}
    }catch(e){}
  });
})();
