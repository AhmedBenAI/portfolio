# Ahmed Bendimered — Portfolio

Personal portfolio website with an AI-powered Job Description Matcher that uses Claude to evaluate fit for any role.

## Project Structure

```
portfolio/
├── server.py              # Flask backend + Claude API endpoint
├── requirements.txt
├── .env                   # API key (not committed)
├── .env.example           # Template for .env
├── .gitignore
├── templates/
│   └── index.html         # Main portfolio page
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## Setup

**1. Clone and install dependencies**

```bash
pip install -r requirements.txt
```

**2. Add your Anthropic API key**

```bash
cp .env.example .env
```

Then edit `.env` and replace `your_api_key_here` with your real key from [console.anthropic.com](https://console.anthropic.com).

**3. Run the server**

```bash
python server.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## JD Matcher

Click **Match Job** (bottom-right button) or **Match My JD ↗** in the hero section. Paste or upload a job description — Claude analyses it against Ahmed's profile and returns:

- Match score (1–10)
- Verdict and summary
- Matching skills and experience
- Gaps to probe at interview
- Suggested interview questions

## API

### `POST /api/analyze-jd`

Request:
```json
{ "job_description": "..." }
```

Response:
```json
{
  "score": 8.5,
  "verdict": "Strong Match",
  "vcolor": "#4ade80",
  "summary": "...",
  "matches": ["..."],
  "gaps": ["..."],
  "whyHire": ["..."],
  "interviewQs": ["..."]
}
```

### `GET /api/health`

Returns `{ "status": "ok" }`.

## Deployment

The server is a standard Flask app — it can be deployed to any platform that supports Python:

- **Railway**: connect your repo, set `ANTHROPIC_API_KEY` in environment variables, done.
- **Render**: same — free tier available, add the env var in the dashboard.
- **Vercel**: requires a `vercel.json` config (ask for help if needed).
- **Fly.io**: `fly launch` then `fly secrets set ANTHROPIC_API_KEY=...`

Set `FLASK_DEBUG=false` and `PORT` to whatever the platform expects in production.
