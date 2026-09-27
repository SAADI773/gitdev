# GitDev

Paste a public GitHub repo URL → GitDev pulls key source files via the GitHub API,
sends them to Gemini, and returns a structured review: overall score, strengths,
mistakes (with severity), and concrete improvements.

## Structure
```
gitdev/
  backend/   Express API — GitHub fetch + Gemini call
  frontend/  React (Vite) UI
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# put your GEMINI_API_KEY in .env (get one free at https://aistudio.google.com/apikey)
# optionally add GITHUB_TOKEN to raise the GitHub rate limit from 60/hr to 5000/hr
npm run dev
```
Runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 (proxies /api calls to the backend)

## How it works
1. `POST /api/evaluate { repoUrl }` parses the owner/repo from the URL.
2. `githubService.js` fetches the repo's file tree, picks up to 18 relevant
   source files (skipping node_modules/dist/lockfiles), and pulls their raw content.
3. `geminiService.js` sends those files to `gemini-2.0-flash` with a system
   prompt forcing structured JSON output, then parses it.
4. The frontend renders score, strengths, mistakes, and improvements as cards.

## Notes / next steps
- Only works on **public** repos (no GitHub auth flow for private ones yet).
- File selection is heuristic (largest code files by extension) — for huge
  monorepos you may want to let the user pick a subfolder.
- Consider caching evaluations by repo+commit SHA to avoid re-spending Gemini
  calls on repeat requests.
