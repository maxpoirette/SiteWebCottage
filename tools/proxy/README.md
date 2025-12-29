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

Security
- This proxy is intentionally minimal. For production consider:
  - restricting allowed target hosts
  - adding rate-limiting and authentication
  - enabling HTTPS via the platform
