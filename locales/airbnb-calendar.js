(function(){
  // diagnostic flag
  try{ window.__airbnbCalendarLoaded = (window.__airbnbCalendarLoaded||0) + 1; }catch(e){}
  // Minimal Airbnb iCal -> calendar renderer
  function detectBase(){
    var s = document.currentScript;
    if(!s){ var scripts=document.getElementsByTagName('script'); for(var i=0;i<scripts.length;i++){ if((scripts[i].src||'').indexOf('airbnb-calendar.js')!==-1){ s=scripts[i]; break; } } }
    try{ return s && s.src ? new URL('.', s.src).href : (location.origin + (location.pathname.endsWith('/') ? location.pathname + 'locales/' : '/locales/')); }catch(e){ return location.origin + '/locales/'; }
  }
  var base = detectBase();
  function fetchSiteVars(){ return fetch(new URL('site-vars.json', base).href).then(function(r){ if(!r.ok) throw new Error('no cfg'); return r.json(); }); }

  function parseICal(text){
    var lines = text.split(/\r?\n/);
    var events = [];
    var cur = null;
    for(var i=0;i<lines.length;i++){
      var l = lines[i];
      if(/^BEGIN:VEVENT/.test(l)){ cur = {}; continue; }
      if(/^END:VEVENT/.test(l)){ if(cur) events.push(cur); cur=null; continue; }
      if(!cur) continue;
      var m = l.match(/^([A-Z]+):(.+)$/);
      if(m){ cur[m[1]] = (cur[m[1]]||'') + m[2]; }
    }
    return events.map(function(e){
      // support DTSTART and DTEND formats YYYYMMDD or YYYYMMDDTHHMMSSZ
      function toDate(s){ try{
          if(!s) return null;
          // remove timezone suffix Z
          if(/T/.test(s)){
            // try ISO
            var iso = s.replace(/([0-9]{8})T([0-9]{6})Z?/, function(_,d,t){ return d.substr(0,4)+'-'+d.substr(4,2)+'-'+d.substr(6,2)+'T'+t.substr(0,2)+':'+t.substr(2,2)+':'+t.substr(4,2)+'Z'; });
            return new Date(iso);
          }
          // date only
          return new Date(s.substr(0,4)+'-'+s.substr(4,2)+'-'+s.substr(6,2)+'T00:00:00Z');
        }catch(e){ return null; }}
      var start = toDate(e.DTSTART);
      var end = toDate(e.DTEND) || start;
      // iCal DTEND is exclusive for full-day events; keep as-is
      return { start:start, end:end };
    }).filter(function(ev){ return ev.start; });
  }

  function daysBetween(a,b){ // a inclusive, b exclusive
    var out=[]; var cur=new Date(Date.UTC(a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate())); var end=new Date(Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()));
    while(cur < end){ out.push(new Date(cur)); cur.setUTCDate(cur.getUTCDate()+1); }
    return out;
  }

  function renderCalendar(container, unavailableSet){
    container.innerHTML = '';
    var now = new Date(); now.setUTCDate(1); now.setUTCHours(0,0,0,0);
    var months = 3;
    var wrapper = document.createElement('div'); wrapper.className='airbnb-calendar-wrapper'; wrapper.style.display='grid'; wrapper.style.gridTemplateColumns='repeat(auto-fit,minmax(220px,1fr))'; wrapper.style.gap='12px';
    for(var m=0;m<months;m++){
      var d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+m, 1));
      var monthBox = document.createElement('div'); monthBox.style.background='#fff'; monthBox.style.padding='8px'; monthBox.style.border='1px solid #e6e6e6'; monthBox.style.borderRadius='6px';
      var title = document.createElement('h4'); title.style.margin='0 0 8px'; title.style.fontSize='1rem'; title.textContent = d.toLocaleString(undefined,{month:'long', year:'numeric'});
      monthBox.appendChild(title);
      var grid = document.createElement('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(7,1fr)'; grid.style.gap='4px';
      var days = ['D','L','M','M','J','V','S']; for(var di=0;di<7;di++){ var hd=document.createElement('div'); hd.style.textAlign='center'; hd.style.fontSize='0.8rem'; hd.style.fontWeight='600'; hd.style.color='#666'; hd.textContent = days[di]; grid.appendChild(hd); }
      var firstDay = d.getUTCDay(); // 0..6 Sun..Sat (UTC)
      if(firstDay===0) firstDay=0; // keep sunday first as in FR? We'll display Sun..Sat but days header is D L M...
      // blank cells
      for(var b=0;b<firstDay;b++){ var blank=document.createElement('div'); blank.innerHTML='&nbsp;'; grid.appendChild(blank); }
      // days
      var month = d.getUTCMonth(); var dayCursor = new Date(d);
      while(dayCursor.getUTCMonth()===month){
        var cell = document.createElement('div');
        cell.style.minHeight='34px'; cell.style.padding='4px'; cell.style.borderRadius='4px'; cell.style.textAlign='right';
        var dayNum = dayCursor.getUTCDate(); cell.textContent = dayNum;
        var key = dayCursor.toISOString().slice(0,10);
        if(unavailableSet.has(key)){
          cell.style.background='#ffefef'; cell.style.color='#b00000';
          cell.title = 'Indisponible';
        } else {
          cell.style.background='#f6fffa'; cell.style.color='#0a6b3a';
          cell.title = 'Disponible';
        }
        grid.appendChild(cell);
        dayCursor.setUTCDate(dayCursor.getUTCDate()+1);
      }
      monthBox.appendChild(grid);
      wrapper.appendChild(monthBox);
    }
    // legend
    var legend = document.createElement('div'); legend.style.gridColumn='1/-1'; legend.style.marginTop='8px'; legend.innerHTML = '<small><span style="display:inline-block;width:12px;height:12px;background:#ffefef;border-radius:2px;margin-right:6px;vertical-align:middle"></span> Indisponible &nbsp;&nbsp; <span style="display:inline-block;width:12px;height:12px;background:#f6fffa;border-radius:2px;margin-right:6px;margin-left:12px;vertical-align:middle"></span> Disponible</small>';
    container.appendChild(wrapper); container.appendChild(legend);
  }

  function computeRangesFromSet(unavailableSet){
    var dates = Array.from(unavailableSet).sort();
    var ranges = [];
    var start = null, end = null;
    dates.forEach(function(d){
      if(!start){ start = d; end = d; return; }
      var prev = new Date(end);
      prev.setUTCDate(prev.getUTCDate()+1);
      var prevKey = prev.toISOString().slice(0,10);
      if(d === prevKey){ end = d; }
      else { ranges.push([start,end]); start = d; end = d; }
    });
    if(start) ranges.push([start,end]);
    return ranges;
  }

  function renderReservationsList(container, unavailableSet){
    try{
      var ranges = computeRangesFromSet(unavailableSet);
      var list = document.createElement('div'); list.style.marginTop='10px';
      if(!ranges.length){ list.innerHTML = '<p style="text-align:center;margin:0.4rem 0;color:#666">Aucune réservation affichée.</p>'; container.appendChild(list); return; }
      var title = document.createElement('h4'); title.textContent='Périodes réservées'; title.style.margin='8px 0 6px'; title.style.fontSize='0.95rem'; list.appendChild(title);
      var ul = document.createElement('ul'); ul.style.margin='0'; ul.style.paddingLeft='1rem'; ranges.forEach(function(r){
        var s = r[0], e = r[1];
        var sd = new Date(s), ed = new Date(e);
        var nights = Math.round((ed - sd)/(1000*60*60*24))+1;
        var li = document.createElement('li'); li.style.marginBottom='4px'; li.textContent = sd.toISOString().slice(0,10) + ' → ' + ed.toISOString().slice(0,10) + ' ('+nights+' j)';
        ul.appendChild(li);
      });
      list.appendChild(ul); container.appendChild(list);
    }catch(e){}
  }

  function mountAll(icalUrlOverride){
    fetchSiteVars().then(function(cfg){
      var defaultIcal = cfg && (cfg.airbnb_ical || cfg.airbnb_ical_url || cfg.AIRBNB_ICAL);
      // detect language (simple, robust heuristics)
      function detectLang(){
        try{
          try{ var ls = localStorage.getItem('site-lang'); if(ls) return (ls||'').substring(0,2); }catch(e){}
          try{ var sel = document.getElementById('languageSelect'); if(sel && sel.value) return (sel.value||'').substring(0,2); }catch(e){}
          if(document.documentElement && document.documentElement.lang) return document.documentElement.lang.substring(0,2);
          var nodes = document.querySelectorAll('.lang-content[data-lang]'); for(var i=0;i<nodes.length;i++){ var el=nodes[i]; var s=window.getComputedStyle(el); if(s && s.display !== 'none') return (el.getAttribute('data-lang')||'').substring(0,2); }
          var any = document.querySelector('[data-lang]'); if(any) return (any.getAttribute('data-lang')||'').substring(0,2);
          if(navigator && navigator.language) return (navigator.language||'').substring(0,2);
        }catch(e){}
        return 'fr';
      }
      var lang = (detectLang() || 'fr').toLowerCase();
      var labels = (cfg && cfg.calendar_labels && cfg.calendar_labels[lang]) || (cfg && cfg.calendar_labels && cfg.calendar_labels['fr']) || {
        loading: 'Chargement du calendrier…', refresh: 'Actualiser', no_reservations: 'Aucune réservation affichée.', reserved_title: 'Périodes réservées', view_listing: 'Voir l\'annonce Airbnb', error_fetch: 'Impossible de charger le calendrier.', refreshing: 'Actualisation…', updated: 'Actualisé', refresh_error: 'Erreur d\'actualisation', no_ical: 'Aucun calendrier configuré.'
      };
      var nodes = document.querySelectorAll('.airbnb-calendar');
      if(!nodes || nodes.length===0){
        console.warn('airbnb-calendar: no .airbnb-calendar nodes found');
      }
      nodes.forEach(function(node){
        try{ node.classList.add('airbnb-calendar-initialized'); }catch(e){}
        var ical = node.dataset.ical || icalUrlOverride || defaultIcal;
        if(!ical){ node.innerHTML = '<p>' + labels.no_ical + '</p>'; return; }
        // build container with refresh button
        node.innerHTML = '';
        // quick visual marker to help debugging if layout hides the calendar
        var debugMarker = document.createElement('div'); debugMarker.style.fontSize='0.9rem'; debugMarker.style.color='#666'; debugMarker.style.textAlign='center'; debugMarker.style.marginBottom='6px'; debugMarker.textContent = labels.loading + ' (initialisé)';
        node.appendChild(debugMarker);
        var topBar = document.createElement('div'); topBar.style.display='flex'; topBar.style.justifyContent='space-between'; topBar.style.alignItems='center'; topBar.style.marginBottom='6px';
        var status = document.createElement('div'); status.style.fontSize='0.95rem'; status.style.color='#666'; status.textContent=labels.loading;
        var btn = document.createElement('button'); btn.textContent=labels.refresh; btn.style.cssText='background:#2d7a4f;color:#fff;border:none;padding:0.4rem 0.6rem;border-radius:6px;cursor:pointer';
        topBar.appendChild(status); topBar.appendChild(btn); node.appendChild(topBar);
        node.innerHTML += '<div class="airbnb-calendar-body"></div>';
        var body = node.querySelector('.airbnb-calendar-body');
        fetch(ical).then(function(r){ if(!r.ok) throw new Error('ical fetch failed'); return r.text(); }).then(function(txt){
          try{ debugMarker.textContent = labels.loading + ' (récupération …)' }catch(e){}
          var events = parseICal(txt);
          var unavailable = new Set();
          events.forEach(function(ev){
            var s = ev.start; var e = ev.end || ev.start;
            // iCal full-day events often have end = day after; treat as exclusive
            var days = daysBetween(s,e);
            days.forEach(function(d){ unavailable.add(d.toISOString().slice(0,10)); });
          });
          renderCalendar(body, unavailable);
          renderReservationsList(body, unavailable);
          status.textContent = labels.updated;
          try{ debugMarker.style.display='none'; }catch(e){}
          // add link to Airbnb listing
          var link = document.createElement('p'); link.style.textAlign='center'; link.style.marginTop='8px';
          var a = document.createElement('a'); a.href = cfg.airbnb_url || cfg.airbnb || 'https://www.airbnb.fr'; a.target='_blank'; a.rel='noopener'; a.textContent = labels.view_listing; a.style.cssText='display:inline-block;padding:0.5rem 0.8rem;background:#ff5a5f;color:#fff;border-radius:6px;text-decoration:none';
          link.appendChild(a); node.appendChild(link);
          // wire refresh
          btn.addEventListener('click', function(){ status.textContent=labels.refreshing; fetch(ical).then(function(r){ if(!r.ok) throw new Error('ical fetch failed'); return r.text(); }).then(function(txt){ var events = parseICal(txt); var unavailable = new Set(); events.forEach(function(ev){ var s = ev.start; var e = ev.end || ev.start; var days = daysBetween(s,e); days.forEach(function(d){ unavailable.add(d.toISOString().slice(0,10)); }); }); body.innerHTML=''; renderCalendar(body, unavailable); renderReservationsList(body, unavailable); status.textContent=labels.updated; }).catch(function(){ status.textContent=labels.refresh_error; }); });
        }).catch(function(err){
          console.error('airbnb-calendar: fetch error', err);
          // direct fetch failed (likely CORS). Try configured proxy (cfg.airbnb_ics_proxy) then localhost fallback
          status.textContent = labels.refreshing;
          var proxyBase = (cfg && (cfg.airbnb_ics_proxy || cfg.ics_proxy)) || 'http://localhost:8001/airbnb.ics?url=';
          function buildProxyUrl(base, url){ try{ if(!base) return null; if(base.indexOf('{url}')!==-1) return base.replace('{url}', encodeURIComponent(url)); if(base.indexOf('?')!==-1 && base.indexOf('=')!==-1) return base + encodeURIComponent(url); return base + (base.endsWith('/')? '': '/') + '?url=' + encodeURIComponent(url); }catch(e){ return base + encodeURIComponent(url); } }
          var proxy = buildProxyUrl(proxyBase, ical);
          fetch(proxy).then(function(r){ if(!r.ok) throw new Error('proxy fetch failed'); return r.text(); }).then(function(txt){
            var events = parseICal(txt);
            var unavailable = new Set();
            events.forEach(function(ev){ var s = ev.start; var e = ev.end || ev.start; var days = daysBetween(s,e); days.forEach(function(d){ unavailable.add(d.toISOString().slice(0,10)); }); });
            body.innerHTML=''; renderCalendar(body, unavailable); renderReservationsList(body, unavailable); status.textContent = labels.updated;
            var link = document.createElement('p'); link.style.textAlign='center'; link.style.marginTop='8px';
            var a = document.createElement('a'); a.href = cfg.airbnb_url || cfg.airbnb || 'https://www.airbnb.fr'; a.target='_blank'; a.rel='noopener'; a.textContent = labels.view_listing; a.style.cssText='display:inline-block;padding:0.5rem 0.8rem;background:#ff5a5f;color:#fff;border-radius:6px;text-decoration:none';
            link.appendChild(a); node.appendChild(link);
          }).catch(function(e){
            node.innerHTML = '<p>' + labels.error_fetch + ' <a href="'+(cfg.airbnb_url||cfg.airbnb||'#')+'" target="_blank" rel="noopener">'+labels.view_listing+'</a></p>';
          });
        });
      });
    }).catch(function(){
      var nodes = document.querySelectorAll('.airbnb-calendar'); nodes.forEach(function(n){ n.innerHTML='<p>Configuration indisponible.</p>'; });
    });
  }

  // auto-run on DOM ready — call mountAll without passing the event object
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ mountAll(); }); else mountAll();
})();
