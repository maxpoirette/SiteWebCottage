(function(){
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

  function mountAll(icalUrlOverride){
    fetchSiteVars().then(function(cfg){
      var defaultIcal = cfg && (cfg.airbnb_ical || cfg.airbnb_ical_url || cfg.AIRBNB_ICAL);
      var nodes = document.querySelectorAll('.airbnb-calendar');
      nodes.forEach(function(node){
        var ical = node.dataset.ical || icalUrlOverride || defaultIcal;
        if(!ical){ node.innerHTML = '<p>Aucun calendrier configuré.</p>'; return; }
        node.innerHTML = '<p style="text-align:center;">Chargement du calendrier…</p>';
        fetch(ical).then(function(r){ if(!r.ok) throw new Error('ical fetch failed'); return r.text(); }).then(function(txt){
          var events = parseICal(txt);
          var unavailable = new Set();
          events.forEach(function(ev){
            var s = ev.start; var e = ev.end || ev.start;
            // iCal full-day events often have end = day after; treat as exclusive
            var days = daysBetween(s,e);
            days.forEach(function(d){ unavailable.add(d.toISOString().slice(0,10)); });
          });
          renderCalendar(node, unavailable);
          // add link to Airbnb listing
          var link = document.createElement('p'); link.style.textAlign='center'; link.style.marginTop='8px';
          var a = document.createElement('a'); a.href = cfg.airbnb_url || cfg.airbnb || 'https://www.airbnb.fr'; a.target='_blank'; a.rel='noopener'; a.textContent = 'Voir l\'annonce Airbnb'; a.style.cssText='display:inline-block;padding:0.5rem 0.8rem;background:#ff5a5f;color:#fff;border-radius:6px;text-decoration:none';
          link.appendChild(a); node.appendChild(link);
        }).catch(function(){
          node.innerHTML = '<p>Impossible de charger le calendrier. <a href="'+(cfg.airbnb_url||cfg.airbnb||'#')+'" target="_blank" rel="noopener">Consulter l\'annonce sur Airbnb</a></p>';
        });
      });
    }).catch(function(){
      var nodes = document.querySelectorAll('.airbnb-calendar'); nodes.forEach(function(n){ n.innerHTML='<p>Configuration indisponible.</p>'; });
    });
  }

  // auto-run on DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mountAll); else mountAll();
})();
