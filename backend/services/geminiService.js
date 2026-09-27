import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in backend/.env!");
}

const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

const SYSTEM_INSTRUCTION = `You are GitDev, a world-class principal software architect and automated code auditor.
You will evaluate a GitHub repository based on its metadata and key source files.

Evaluate the codebase thoroughly, objectively, and specifically. Reference actual file names, classes, exported functions, or code patterns you observe.

You MUST respond with ONLY a single valid JSON object (no markdown wrapping, no extra text) conforming strictly to this schema:

{
  "overallScore": <integer 0-100>,
  "grade": "<A+|A|B+|B|C|D|F>",
  "summary": "<3-4 sentence comprehensive evaluation verdict>",
  "securityRating": "<A|B|C|D|F>",
  "maintainabilityRating": "<A|B|C|D|F>",
  "architectureOverview": "<1-2 sentence description of the system architecture & pattern used>",
  "techStack": ["<technology name>", ...],
  "quickWins": [
    "<High impact, quick fix developers can make immediately>", ...
  ],
  "strengths": [
    {
      "title": "<concise title>",
      "detail": "<1-2 sentences explaining why this pattern/code is exemplary>"
    }
  ],
  "mistakes": [
    {
      "title": "<concise title>",
      "file": "<exact file path or 'general'>",
      "severity": "low|medium|high",
      "detail": "<explanation of the bug, code smell, security flaw, or anti-pattern and why it matters>"
    }
  ],
  "improvements": [
    {
      "title": "<concise title>",
      "file": "<exact file path or 'general'>",
      "detail": "<actionable, specific recommendation with concrete design advice>"
    }
  ]
}

Provide 3-6 detailed entries for strengths, mistakes, quickWins, and improvements.`;

function buildPrompt(bundle) {
  const { meta, files } = bundle;
  const fileBlocks = files
    .map((f) => `--- FILE: ${f.path} (${f.size} bytes) ---\n${f.content}`)
    .join("\n\n");

  return `REPOSITIORY METADATA:
Name: ${meta.name}
Description: ${meta.description || "None provided"}
Primary Language: ${meta.language || "Unknown"}
Stars: ${meta.stars} | Forks: ${meta.forks} | Open Issues: ${meta.open_issues}
Branch: ${meta.branch} ${meta.subfolder ? `(Subfolder: ${meta.subfolder})` : ""}

SOURCE FILES (${files.length} key source files sampled):

${fileBlocks}`;
}

function extractJson(text) {
  try {
    // Attempt standard JSON parse first
    return JSON.parse(text);
  } catch {
    // Fallback: strip markdown code blocks if present
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const raw = fenced ? fenced[1] : text;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("Gemini response did not contain parseable JSON.");
    }
    return JSON.parse(raw.slice(start, end + 1));
  }
}

export async function evaluateRepo(bundle) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please set your API key in backend/.env file."
    );
  }

  const availableModels = ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.1-flash"];
  let result = null;
  let lastError = null;

  for (const modelName of availableModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const prompt = buildPrompt(bundle);
      result = await model.generateContent(prompt);
      if (result) break;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} failed, trying next fallback... (${err.message})`);
    }
  }

  if (!result) {
    throw lastError || new Error("Failed to generate content with Gemini API.");
  }
  const responseText = result.response.text();
  const parsed = extractJson(responseText);

  return {
    ...parsed,
    meta: bundle.meta,
    filesReviewed: bundle.files.map((f) => ({ path: f.path, size: f.size })),
    evaluatedAt: new Date().toISOString(),
  };
}
