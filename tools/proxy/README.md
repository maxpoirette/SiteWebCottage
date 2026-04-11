Deployable proxy for Airbnb .ics

Overview
- Small Node/Express app that fetches an Airbnb .ics URL and returns it with CORS headers.

Quick start (local):

```bash
cd tools/proxy
npm install
npm start
# then open your site and ensure `site-vars.json` points `airbnb_ics_proxy` to
# http://<host>:8001/airbnb.ics?url=
```

Deployment
- Suitable for small platforms (Heroku, Railway, Render). Ensure `NODE_VERSION` >= 18.
- Set `PORT` env var as provided by the platform.

Recommended production setup (hide the iCal token)
- Set env var `AIRBNB_ICAL_URL` to the real Airbnb iCal URL (the one ending with `.ics?t=...`).
- (Optional) Set `ALLOWED_ORIGINS` to your site origins, comma-separated.
  - Example: `https://cottagedulac13.com,https://www.cottagedulac13.com`

Then configure the site in `locales/site-vars.json`:
- Set `airbnb_ical` to your proxy endpoint, for example:
  - `https://<your-proxy-host>/airbnb.ics`
- Keep `airbnb_ics_proxy` empty (not needed if `airbnb_ical` points directly to the proxy).

Alternative (less private)
- Keep `airbnb_ical` as the Airbnb URL and set `airbnb_ics_proxy` to:
  - `https://<your-proxy-host>/airbnb.ics?url=`

Security
- This proxy is intentionally minimal. For production consider:
  - restricting allowed target hosts (supported via `ALLOWED_HOSTS`)
  - restricting origins (supported via `ALLOWED_ORIGINS`)
  - adding rate-limiting and authentication
  - enabling HTTPS via the platform
