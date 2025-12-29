const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// GET /airbnb.ics?url=<encoded-url>
app.get('/airbnb.ics', async (req, res) => {
  const url = req.query.url;
  if(!url){ res.status(400).send('Missing url parameter'); return; }
  try{
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000, headers: { 'User-Agent': 'airbnb-ics-proxy/1.0' } });
    const contentType = r.headers['content-type'] || 'text/calendar';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=300');
    res.send(r.data);
  }catch(err){
    res.status(502).send('Proxy error: ' + (err.message || 'fetch failed'));
  }
});

const port = process.env.PORT || 8001;
app.listen(port, () => console.log('airbnb-ics-proxy listening on', port));
