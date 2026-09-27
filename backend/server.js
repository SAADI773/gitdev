import "dotenv/config";
import express from "express";
import cors from "cors";
import { parseRepoUrl, fetchRepoBundle } from "./services/githubService.js";
import { evaluateRepo } from "./services/geminiService.js";

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Evaluation Cache (Key: normalized URL, Value: { data, expiresAt })
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

app.post("/api/evaluate", async (req, res) => {
  const { repoUrl, forceRefresh } = req.body;

  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ error: "repoUrl parameter is required." });
  }

  try {
    const { owner, repo, branch, subfolder } = parseRepoUrl(repoUrl);
    const cacheKey = `${owner}/${repo}:${branch || "default"}:${subfolder}`;

    // Check cache unless forceRefresh is true
    if (!forceRefresh) {
      const cachedResult = getCached(cacheKey);
      if (cachedResult) {
        return res.json({ ...cachedResult, isCached: true });
      }
    }

    const bundle = await fetchRepoBundle(owner, repo, branch, subfolder);

    if (!bundle.files || bundle.files.length === 0) {
      return res.status(422).json({
        error: "No reviewable code files found in this repository or subfolder.",
      });
    }

    const evaluation = await evaluateRepo(bundle);
    const responsePayload = { ...evaluation, isCached: false };

    // Cache evaluation
    setCached(cacheKey, responsePayload);

    res.json(responsePayload);
  } catch (err) {
    console.error("Evaluation Error:", err.message);
    const statusCode = err.message.includes("rate limit") ? 429 : 500;
    res.status(statusCode).json({
      error: err.message || "An unexpected error occurred during evaluation.",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
  });
});

app.get("/api/cache-stats", (_req, res) => {
  res.json({
    cachedEntries: cache.size,
    ttlMinutes: CACHE_TTL_MS / (60 * 1000),
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 GitDev Backend Server listening on http://localhost:${PORT}`);
  });
}

export default app;
