# Ahmed Bendimered — Portfolio (Frontend)

Static portfolio site deployed on Vercel. Calls a separate backend API for the AI-powered JD Matcher.

## Structure

```
portfolio/
├── templates/
│   └── index.html        ← main page
├── static/
│   ├── css/style.css
│   └── js/app.js         ← set API_BASE here before deploying
├── vercel.json
```

## Deploying the frontend (Vercel)

1. Push this repo to GitHub
2. Import into Vercel — it picks up `vercel.json` automatically
3. No env vars needed for the frontend itself

## Connecting to the backend

Once your backend is deployed, open [static/js/app.js](static/js/app.js) and set:

```js
const API_BASE = 'https://your-backend.railway.app';
```

Then push — Vercel redeploys automatically.