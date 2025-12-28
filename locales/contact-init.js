// Load contact email from site-vars.json and inject into forms with data-dynamic-form
(function(){
  const cfgPath = '/locales/site-vars.json';
  fetch(cfgPath).then(r=>r.json()).then(cfg=>{
    const email = cfg.contact_email;
    if (!email) return;
    const forms = document.querySelectorAll('form[data-dynamic-form]');
    forms.forEach(f=>{
      try{
        f.action = 'https://formsubmit.co/' + encodeURIComponent(email);
      }catch(e){console.error(e)}
    });
  }).catch(err=>{
    console.warn('Could not load site-vars.json for contact injection', err);
  });
})();
