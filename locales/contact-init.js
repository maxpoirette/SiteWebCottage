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
  // cache for fetched config so later DOM changes can re-use it
  var __contact_cfg_cache = null;
  // localized strings (defaults in French)
  var loc = {
    title: 'Merci !',
    message: 'Votre message a bien été envoyé — nous vous répondrons bientôt.',
    close: 'Fermer',
    imgAlt: 'Les Cottages du Lac'
  };

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
    css.textContent = '\n#contact-thanks-modal{position:fixed;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);z-index:9999}\n#contact-thanks-modal .box{background:#fff;padding:1.5rem;border-radius:8px;max-width:480px;width:90%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2)}\n#contact-thanks-modal .thumb{width:100%;height:180px;object-fit:cover;border-radius:6px;margin-bottom:0.75rem}\n#contact-thanks-modal .close{margin-top:1rem;background:#2d7a4f;color:#fff;border:none;padding:0.6rem 1rem;border-radius:6px;cursor:pointer}\n';
    document.head.appendChild(css);
    var modal = document.createElement('div');
    modal.id = 'contact-thanks-modal';
    modal.style.display = 'none';
    // compute image URL candidates relative to this script base so it works on GH Pages project sites
    var imgCandidates = [];
    try{
      imgCandidates.push(new URL('../photos/vue-lac.jpg', base).href);
      imgCandidates.push(new URL('../photos/parentis-en-born-landes.jpeg', base).href);
      imgCandidates.push(new URL('../photos/Banniere.png', base).href);
    }catch(e){
      imgCandidates.push('/photos/vue-lac.jpg','/photos/parentis-en-born-landes.jpeg','/photos/Banniere.png');
    }
    modal.innerHTML = '<div class="box"><img class="thumb" src="'+imgCandidates[0]+'" alt="'+(loc.imgAlt||'')+'"><h2>'+(loc.title||'')+'</h2><p>'+(loc.message||'')+'</p><button class="close">'+(loc.close||'')+'</button></div>';
    // try fallbacks when image fails to load
    (function(){
      var img = modal.querySelector('.thumb');
      if(!img) return;
      var idx = 0;
      img.addEventListener('error', function(){
        idx++;
        if(idx < imgCandidates.length) img.src = imgCandidates[idx];
      });
    })();
    document.body.appendChild(modal);
    modal.querySelector('.close').addEventListener('click', function(){
      modal.style.display='none';
      try{
        // reset all dynamic contact forms
        var forms = document.querySelectorAll('form[data-dynamic-form]');
        forms.forEach(function(f){
          try{ f.reset(); }catch(e){}
        });
        // focus first input of first form if present
        if(forms.length){
          var first = forms[0].querySelector('input,textarea,select');
          if(first) try{ first.focus(); }catch(e){}
        }
      }catch(e){}
    });
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
          // sandbox to prevent iframe content from navigating the top window
          ifr.setAttribute('sandbox', 'allow-forms allow-scripts');
          ifr.src = 'about:blank';
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
    __contact_cfg_cache = cfg;
    // detect language from <html lang> or fallback to 'fr'
    var pageLang = (document.documentElement && document.documentElement.lang) ? document.documentElement.lang.substring(0,2) : null;
    // Try loading a per-language merci JSON (locales/merci_{lang}.json). Fallback to cfg.thanks if not present.
    try{
      var lang = pageLang || 'fr';
      var merciUrl = new URL('merci_' + lang + '.json', base).href;
      fetch(merciUrl).then(function(r){
        if(r.ok) return r.json();
        throw new Error('merci json not found');
      }).then(function(m){
        loc.title = m.title || loc.title;
        loc.message = m.message || loc.message;
        loc.close = m.close || loc.close;
        loc.imgAlt = m.imgAlt || loc.imgAlt;
      }).catch(function(){
        // fallback to site-vars.json thanks section if present
        try{
          if(cfg && cfg.thanks){
            var entry = cfg.thanks[lang] || cfg.thanks[lang.toLowerCase()] || null;
            if(entry){
              loc.title = entry.title || loc.title;
              loc.message = entry.message || loc.message;
              loc.close = entry.close || loc.close;
              loc.imgAlt = entry.imgAlt || loc.imgAlt;
            }
          }
        }catch(e){}
      });
    }catch(e){}
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

    // Observe DOM changes so the script works when locale HTML is injected
    // (e.g. via the language selector which replaces page fragments).
    try{
      var obs = new MutationObserver(function(muts){
        var found = false;
        muts.forEach(function(m){
          m.addedNodes && Array.prototype.forEach.call(m.addedNodes, function(n){
            try{
              if(n.nodeType === 1){
                if(n.matches && n.matches('form[data-dynamic-form]')) found = true;
                if(n.querySelector && n.querySelector('form[data-dynamic-form]')) found = true;
              }
            }catch(e){}
          });
        });
        if(found){
          try{
            // ensure email action is applied first (use cache if available, otherwise fetch)
            if(__contact_cfg_cache && __contact_cfg_cache.contact_email){
              applyEmailToForms(__contact_cfg_cache.contact_email);
            }else{
              // fetch quickly and apply
              try{ fetch(cfgUrl).then(function(r){ if(r.ok) return r.json(); }).then(function(c){ if(c && c.contact_email) applyEmailToForms(c.contact_email); __contact_cfg_cache = c; }).catch(function(){}); }catch(e){}
            }
          }catch(e){}
          try{ guardForms(); }catch(e){}
          try{ absolutizeNexts(); }catch(e){}
          try{ attachHiddenIframeSubmit(); }catch(e){}
        }
      });
      obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }catch(e){}
})();
