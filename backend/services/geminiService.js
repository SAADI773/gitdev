import { GoogleGenerativeAI } from "@google/generative-ai";

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
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const raw = fenced ? fenced[1] : text;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("AI response did not contain parseable JSON.");
    }
    return JSON.parse(raw.slice(start, end + 1));
  }
}

async function evaluateWithGemini(bundle, modelName, customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please enter your API key in the Model Selection popup or configure backend/.env."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [modelName || "gemini-2.5-flash", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let result = null;
  let lastError = null;

  for (const m of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: m,
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
      console.warn(`Gemini model ${m} failed: ${err.message}. Trying next fallback...`);
    }
  }

  if (!result) {
    throw lastError || new Error("Failed to generate content with Gemini API.");
  }
  const responseText = result.response.text();
  return extractJson(responseText);
}

async function evaluateWithOpenAI(bundle, modelName, customApiKey) {
  const apiKey = customApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Please enter your OpenAI API key in the Model Selection popup or configure backend/.env."
    );
  }

  const selectedModel = modelName || "gpt-4o";
  const prompt = buildPrompt(bundle);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI API error (${response.status})`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response received from OpenAI API.");
  }

  return extractJson(content);
}

async function evaluateWithGrok(bundle, modelName, customApiKey) {
  const apiKey = customApiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROK_API_KEY (or XAI_API_KEY) is missing. Please enter your Grok API key in the Model Selection popup or configure backend/.env."
    );
  }

  const selectedModel = modelName || "grok-2-latest";
  const prompt = buildPrompt(bundle);

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Grok/xAI API error (${response.status})`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response received from Grok API.");
  }

  return extractJson(content);
}

export async function evaluateRepo(bundle, options = {}) {
  const provider = (options.provider || "gemini").toLowerCase();
  const modelName = options.model;
  const apiKey = options.apiKey;

  let parsed = null;
  let activeProvider = provider;
  let activeModel = modelName;

  if (provider === "openai") {
    activeModel = activeModel || "gpt-4o";
    parsed = await evaluateWithOpenAI(bundle, activeModel, apiKey);
  } else if (provider === "grok" || provider === "xai") {
    activeProvider = "grok";
    activeModel = activeModel || "grok-2-latest";
    parsed = await evaluateWithGrok(bundle, activeModel, apiKey);
  } else {
    activeProvider = "gemini";
    activeModel = activeModel || "gemini-2.5-flash";
    parsed = await evaluateWithGemini(bundle, activeModel, apiKey);
  }

  return {
    ...parsed,
    meta: bundle.meta,
    filesReviewed: bundle.files.map((f) => ({ path: f.path, size: f.size })),
    evaluatedAt: new Date().toISOString(),
    selectedProvider: activeProvider,
    selectedModel: activeModel,
  };
}

