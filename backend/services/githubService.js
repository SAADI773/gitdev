const GITHUB_API = "https://api.github.com";

// Extensions worth sending to the model.
const CODE_EXTENSIONS = new Set([
  "js", "jsx", "ts", "tsx", "py", "java", "go", "rb", "php", "c", "cpp", "h", "hpp",
  "cs", "rs", "swift", "kt", "html", "css", "scss", "sass", "less", "vue", "svelte",
  "json", "md", "yml", "yaml", "sql", "sh", "bash", "dockerfile", "prisma", "graphql",
  "toml"
]);

// Paths we never want to pull in.
const IGNORED_SEGMENTS = [
  "node_modules/", "dist/", "build/", ".next/", ".nuxt/", "vendor/", "venv/",
  ".venv/", ".git/", "coverage/", "__pycache__/", ".idea/", ".vscode/",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock"
];

function authHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Parses user input into owner, repo, branch (optional), subfolder (optional).
 * Supports inputs like:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/dev/src/components
 * - owner/repo
 */
export function parseRepoUrl(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid URL input");
  }

  let cleaned = input.trim().replace(/\.git$/, "");
  
  // If user pasted owner/repo shortcode without https
  if (!cleaned.includes("http://") && !cleaned.includes("https://")) {
    if (!cleaned.includes("github.com")) {
      cleaned = `https://github.com/${cleaned}`;
    }
  }

  try {
    const url = new URL(cleaned);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Expected URL in format https://github.com/owner/repo");
    }

    const owner = parts[0];
    const repo = parts[1];
    let branch = null;
    let subfolder = "";

    // Handle /tree/branch/subfolder URLs
    if (parts[2] === "tree" && parts.length > 3) {
      branch = parts[3];
      if (parts.length > 4) {
        subfolder = parts.slice(4).join("/");
      }
    }

    return { owner, repo, branch, subfolder };
  } catch (err) {
    // Fallback regex match
    const match = cleaned.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/i);
    if (!match) {
      throw new Error(
        "Couldn't parse repository URL. Expected format: https://github.com/owner/repo"
      );
    }
    return { owner: match[1], repo: match[2], branch: null, subfolder: "" };
  }
}

async function githubFetch(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        "GitHub API rate limit exceeded. Add a GITHUB_TOKEN in backend/.env to increase rate limits."
      );
    }
    if (res.status === 404) {
      throw new Error("Repository or branch not found. Make sure it is a public repository.");
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function isWanted(path, targetSubfolder = "") {
  if (targetSubfolder && !path.startsWith(targetSubfolder)) return false;
  if (IGNORED_SEGMENTS.some((seg) => path.includes(seg))) return false;
  
  const filename = path.split("/").pop().toLowerCase();
  if (filename === "dockerfile" || filename === "makefile") return true;

  const ext = path.split(".").pop()?.toLowerCase();
  return CODE_EXTENSIONS.has(ext);
}

const MAX_FILE_BYTES = 14000;
const MAX_TOTAL_FILES = 20;
const FETCH_CONCURRENCY = 6;

export async function fetchRepoBundle(owner, repo, targetBranch = null, targetSubfolder = "") {
  const info = await githubFetch(`${GITHUB_API}/repos/${owner}/${repo}`);
  const branch = targetBranch || info.default_branch || "main";

  const treeData = await githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );

  const allTreeItems = treeData.tree || [];

  // Filter wanted blobs
  const candidates = allTreeItems
    .filter((item) => item.type === "blob" && isWanted(item.path, targetSubfolder))
    .sort((a, b) => (b.size || 0) - (a.size || 0));

  // Prioritize root configuration/readme files
  const priorityRegex = /^(readme\.md|package\.json|requirements\.txt|pyproject\.toml|go\.mod|cargo\.toml|dockerfile|composer\.json|tsconfig\.json)$/i;
  
  const priorityPaths = allTreeItems
    .map((i) => i.path)
    .filter((p) => {
      const filename = p.split("/").pop();
      return priorityRegex.test(filename) && isWanted(p, targetSubfolder);
    });

  const pathsToFetch = Array.from(
    new Set([...priorityPaths, ...candidates.map((c) => c.path)])
  ).slice(0, MAX_TOTAL_FILES);

  // Parallel file fetcher with batching
  const files = [];
  for (let i = 0; i < pathsToFetch.length; i += FETCH_CONCURRENCY) {
    const batch = pathsToFetch.slice(i, i + FETCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (path) => {
        try {
          const raw = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
          );
          if (!raw.ok) return null;
          let content = await raw.text();
          if (content.length > MAX_FILE_BYTES) {
            content = content.slice(0, MAX_FILE_BYTES) + "\n... [truncated for evaluation]";
          }
          return { path, content, size: content.length };
        } catch {
          return null;
        }
      })
    );
    files.push(...results.filter(Boolean));
  }

  return {
    meta: {
      name: info.full_name,
      description: info.description,
      stars: info.stargazers_count,
      forks: info.forks_count,
      open_issues: info.open_issues_count,
      language: info.language,
      branch,
      subfolder: targetSubfolder,
      url: info.html_url,
      updated_at: info.updated_at
    },
    files,
  };
}
