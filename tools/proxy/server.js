const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

function parseCsvEnv(name){
  return String(process.env[name] || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

const allowedOrigins = parseCsvEnv('ALLOWED_ORIGINS');
app.use(cors({
  origin: function(origin, cb){
    // allow non-browser clients (no Origin header)
    if(!origin) return cb(null, true);
    if(allowedOrigins.length === 0) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  }
}));

function isAllowedTargetHost(hostname){
  const allowHosts = parseCsvEnv('ALLOWED_HOSTS');
  if(allowHosts.length > 0) return allowHosts.includes(hostname);

  // default allowlist: Airbnb public domains
  return hostname === 'airbnb.com'
    || hostname.endsWith('.airbnb.com')
    || hostname === 'airbnb.fr'
    || hostname.endsWith('.airbnb.fr');
}

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true });
});

// GET /airbnb.ics?url=<encoded-url>
app.get('/airbnb.ics', async (req, res) => {
  const url = req.query.url || process.env.AIRBNB_ICAL_URL;
  if(!url){ res.status(400).send('Missing url parameter (or set AIRBNB_ICAL_URL)'); return; }

  let target;
  try{
    target = new URL(String(url));
  }catch(e){
    res.status(400).send('Invalid url');
    return;
  }

  if(!(target.protocol === 'https:' || target.protocol === 'http:')){
    res.status(400).send('Unsupported protocol');
    return;
  }
  if(!isAllowedTargetHost(target.hostname)){
    res.status(403).send('Target host not allowed');
    return;
  }

  try{
    const r = await axios.get(target.toString(), {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'airbnb-ics-proxy/1.1' }
    });
    const contentType = r.headers['content-type'] || 'text/calendar';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.send(r.data);
  }catch(err){
    res.status(502).send('Proxy error: ' + (err.message || 'fetch failed'));
  }
});

const port = process.env.PORT || 8001;
app.listen(port, () => console.log('airbnb-ics-proxy listening on', port));
