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

  // detect current page language in a robust way (checks localStorage, selector, html lang, visible fragments)
  function detectPageLang(){
    try{
      try{ var ls = localStorage.getItem('site-lang'); if(ls) return (ls||'').substring(0,2); }catch(e){}
      try{ var sel = document.getElementById('languageSelect'); if(sel && sel.value) return (sel.value||'').substring(0,2); }catch(e){}
      if(document.documentElement && document.documentElement.lang) return document.documentElement.lang.substring(0,2);
      var nodes = document.querySelectorAll('.lang-content[data-lang]');
      for(var i=0;i<nodes.length;i++){ var el = nodes[i]; var s = window.getComputedStyle(el); if(s && s.display !== 'none') return (el.getAttribute('data-lang')||'').substring(0,2); }
      var any = document.querySelector('[data-lang]'); if(any) return (any.getAttribute('data-lang')||'').substring(0,2);
    }catch(e){}
    return 'fr';
  }

  // load merci_{lang}.json and apply to `loc` (returns a Promise)
  function loadMerciForLang(lang){
    return new Promise(function(resolve){
      try{
        var merciUrl = new URL('merci_' + (lang||'fr') + '.json', base).href;
        fetch(merciUrl).then(function(r){ if(r.ok) return r.json(); throw new Error('merci json not found'); }).then(function(m){
          loc.title = m.title || loc.title;
          loc.message = m.message || loc.message;
          loc.close = m.close || loc.close;
          loc.imgAlt = m.imgAlt || loc.imgAlt;
          updateModalContent();
          resolve();
        }).catch(function(){
          // fallback to site-vars.json thanks if present
          try{
            if(__contact_cfg_cache && __contact_cfg_cache.thanks){
              var entry = __contact_cfg_cache.thanks[lang] || __contact_cfg_cache.thanks[lang && lang.toLowerCase()];
              if(entry){
                loc.title = entry.title || loc.title;
                loc.message = entry.message || loc.message;
                loc.close = entry.close || loc.close;
                loc.imgAlt = entry.imgAlt || loc.imgAlt;
              }
            }
          }catch(e){}
          updateModalContent();
          resolve();
        });
      }catch(e){ updateModalContent(); resolve(); }
    });
  }

  // update modal DOM if it exists (title/message/button/img alt)
  function updateModalContent(){
    try{
      var modal = document.getElementById('contact-thanks-modal');
      if(!modal) return;
      var box = modal.querySelector('.box');
      if(!box) return;
      var img = box.querySelector('.thumb');
      if(img) try{ img.alt = loc.imgAlt || img.alt; }catch(e){}
      var h2 = box.querySelector('h2'); if(h2) try{ h2.textContent = loc.title || h2.textContent; }catch(e){}
      var p = box.querySelector('p'); if(p) try{ p.textContent = loc.message || p.textContent; }catch(e){}
      var btn = box.querySelector('button.close'); if(btn) try{ btn.textContent = loc.close || btn.textContent; }catch(e){}
    }catch(e){}
  }

  // attach guard to prevent submit before injection
  // helper to submit a form into an iframe (used by hijack and by retry logic)
  function submitFormToIframe(f){
    try{
      var name = f.target || ('contact_iframe_auto');
      // ensure iframe exists
      if(!document.querySelector('iframe[name="'+name+'"]')){
        var ifr = document.createElement('iframe');
        ifr.name = name;
        ifr.style.display = 'none';
        // keep sandbox minimal: allow forms but do NOT allow remote scripts
        ifr.setAttribute('sandbox', 'allow-forms');
        ifr.src = 'about:blank';
        document.body.appendChild(ifr);
        ifr.addEventListener('load', function(){
          try{
            var modal = document.getElementById('contact-thanks-modal');
            var curLang = detectPageLang() || 'fr';
            try{ loadMerciForLang(curLang).then(function(){ try{ updateModalContent(); if(modal) modal.style.display = 'flex'; }catch(e){} }).catch(function(){ try{ updateModalContent(); if(modal) modal.style.display = 'flex'; }catch(e){} }); }catch(e){ if(modal) modal.style.display = 'flex'; }
          }catch(e){ try{ var modal = document.getElementById('contact-thanks-modal'); if(modal) modal.style.display = 'flex'; }catch(e){} }
        });
      }
      // build a temporary form to submit to the iframe
      var tmp = document.createElement('form');
      tmp.style.display = 'none';
      tmp.method = (f.method || 'POST');
      tmp.action = f.action;
      tmp.target = name;
      var elements = f.querySelectorAll('input,textarea,select');
      elements.forEach(function(el){ if(!el.name) return; var i = document.createElement('input'); i.type='hidden'; i.name = el.name; i.value = el.value || ''; tmp.appendChild(i); });
      document.body.appendChild(tmp);
      tmp.submit();
      setTimeout(function(){ try{ document.body.removeChild(tmp); }catch(e){} }, 2000);
      return true;
    }catch(e){return false;}
  }

  // Try to inject email action and submit the form into the iframe with retries.
  function tryInjectAndSubmitForForm(f){
    var attempts = 0;
    function attempt(){
      attempts++;
      try{
        if(__contact_cfg_cache && __contact_cfg_cache.contact_email){
          applyEmailToForms(__contact_cfg_cache.contact_email);
          try{ absolutizeNexts(); }catch(e){}
          try{ attachHiddenIframeSubmit(); }catch(e){}
        }
        else {
          fetch(cfgUrl).then(function(r){ if(r.ok) return r.json(); }).then(function(c){ if(c && c.contact_email) applyEmailToForms(c.contact_email); __contact_cfg_cache = c; try{ absolutizeNexts(); }catch(e){} try{ attachHiddenIframeSubmit(); }catch(e){} }).catch(function(){});
        }
      }catch(e){}
      // Try immediate submission if injection already applied synchronously
      try{ if(f.dataset.contactInjected === 'true'){ if(submitFormToIframe(f)) return; } }catch(e){}
      setTimeout(function(){
        if(f.dataset.contactInjected === 'true'){
          if(submitFormToIframe(f)) return;
        }
        if(attempts < 8) attempt();
        else {
          try{ alert('Le formulaire n\'est pas prêt. Veuillez patienter quelques instants puis r\u00e9essayer.'); }catch(e){}
        }
      }, 200);
    }
    attempt();
  }

  function guardForms(){
    var forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(function(f){
      if(f.__contactGuardAttached) return;
      f.__contactGuardAttached = true;
      f.dataset.contactInjected = 'false';
      f.addEventListener('submit', function(ev){
        if(f.dataset.contactInjected === 'true') return; // already injected, allow normal flow (hijack will handle)
        ev.preventDefault();
        tryInjectAndSubmitForForm(f);
      });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', guardForms); else guardForms();

  // Global capturing submit handler: this intercepts submits even on newly injected forms
  // and ensures we attempt injection before the browser performs a normal POST.
  try{
    document.addEventListener('submit', function(ev){
      try{
        var f = ev.target;
        if(!f || f.nodeName !== 'FORM') return;
        if(!f.hasAttribute('data-dynamic-form')) return;
        if(f.dataset.contactInjected === 'true') return; // already prepared
        // prevent native submit and attempt injection+iframe submit
        ev.preventDefault();
        try{ ev.stopImmediatePropagation(); }catch(e){}
        tryInjectAndSubmitForForm(f);
      }catch(e){}
    }, true);
  }catch(e){}

  // Intercept programmatic .submit() calls on forms so they also go through our injection
  try{
    var __origFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function(){
      try{
        if(this && this.hasAttribute && this.hasAttribute('data-dynamic-form')){
          if(this.dataset && this.dataset.contactInjected === 'true'){
            return __origFormSubmit.apply(this, arguments);
          }
          tryInjectAndSubmitForForm(this);
          return;
        }
      }catch(e){}
      return __origFormSubmit.apply(this, arguments);
    };
  }catch(e){}

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
        if(inp && inp.value){
          try{
            // Resolve relative paths against the detected site base so FormSubmit redirects
            // back to our domain instead of to formsubmit.co/locales/...
            var resolved = new URL(inp.value, base).href;
            // If the _next points to an old merci_*.html, map it to our minimal merci.html
            try{
              var m = (inp.value || '').match(/merci[_-]?([a-z]{2})/i);
              if(m && m[1]){
                resolved = new URL('locales/merci.html', base).href;
              }
            }catch(e){}
            // If somebody configured _next to point at a full locale page (e.g. /locales/de.html)
            // rewrite it to the minimal thank-you page as well to avoid loading a page with
            // scripts into our sandboxed iframe (which only allows forms and will log blocked
            // script execution). This removes console noise while keeping behavior.
            try{
              var p = new URL(resolved).pathname || '';
              if(/\/locales\/.+\.html$/.test(p) && !p.endsWith('/merci.html')){
                resolved = new URL('locales/merci.html', base).href;
              }
            }catch(e){}
            inp.value = resolved;
          }catch(e){}
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
          // sandbox to prevent iframe content from navigating the top window and to
          // avoid executing remote scripts inside the iframe (prevents cross-origin
          // script errors logged to the console).
          ifr.setAttribute('sandbox', 'allow-forms');
          ifr.src = 'about:blank';
          document.body.appendChild(ifr);
          // when iframe loads, show modal
          ifr.addEventListener('load', function(){
            try{
              var modal = document.getElementById('contact-thanks-modal');
              var curLang = detectPageLang() || 'fr';
              try{ loadMerciForLang(curLang).then(function(){ try{ updateModalContent(); if(modal) modal.style.display = 'flex'; }catch(e){} }).catch(function(){ try{ updateModalContent(); if(modal) modal.style.display = 'flex'; }catch(e){} }); }catch(e){ if(modal) modal.style.display = 'flex'; }
            }catch(e){ try{ var modal = document.getElementById('contact-thanks-modal'); if(modal) modal.style.display = 'flex'; }catch(e){} }
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
    var pageLang = detectPageLang() || null;
    // Try loading a per-language merci JSON (locales/merci_{lang}.json). Fallback to cfg.thanks if not present.
    try{
      var lang = pageLang || 'fr';
      loadMerciForLang(lang);
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
          // detect current page language (may have changed via selector)
          var newLang = detectPageLang() || 'fr';
          loadMerciForLang(newLang).finally(function(){
            // ensure email action is applied first (use cache if available, otherwise fetch)
            try{
              if(__contact_cfg_cache && __contact_cfg_cache.contact_email){
                applyEmailToForms(__contact_cfg_cache.contact_email);
              }else{
                try{ fetch(cfgUrl).then(function(r){ if(r.ok) return r.json(); }).then(function(c){ if(c && c.contact_email) applyEmailToForms(c.contact_email); __contact_cfg_cache = c; }).catch(function(){}); }catch(e){}
              }
            }catch(e){}
            try{ guardForms(); }catch(e){}
            try{ absolutizeNexts(); }catch(e){}
            try{ attachHiddenIframeSubmit(); }catch(e){}
          });
        }catch(e){}
      }
      });
      obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }catch(e){}
})();
