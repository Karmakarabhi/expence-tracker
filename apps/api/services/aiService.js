/**
 * aiService.js
 *
 * AI is ONLY the explanation layer.
 * It receives structured findings from the rules engine and produces natural-language text.
 *
 * The AI does NOT:
 *   - calculate numbers
 *   - decide severity
 *   - assign scores
 *   - determine what is a problem
 *
 * The AI ONLY:
 *   - explains findings in plain English for an Indian retail investor
 *   - provides actionable guidance grounded in the provided evidence
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Schema validators ─────────────────────────────────────────────────────────

/**
 * Validate that every finding in the rules engine has a corresponding explanation.
 * Returns cleaned, validated output or throws if the response is unusable.
 */
function validateExplanations(parsed, findings) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response is not a JSON object');
  }
  if (!parsed.explanations || typeof parsed.explanations !== 'object') {
    throw new Error('AI response missing "explanations" object');
  }
  if (!parsed.portfolioSummary || typeof parsed.portfolioSummary !== 'string') {
    throw new Error('AI response missing "portfolioSummary" string');
  }

  // Ensure all expected finding types are present
  const missingTypes = findings
    .map(f => f.type)
    .filter(t => !parsed.explanations[t] || typeof parsed.explanations[t] !== 'string');

  if (missingTypes.length > 0) {
    throw new Error(`AI response missing explanations for: ${missingTypes.join(', ')}`);
  }

  return parsed;
}

function validateHoldingExplanation(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a JSON object');
  const required = ['whatItIs', 'commonUse', 'portfolioContribution', 'keyRisks', 'whatToMonitor'];
  for (const field of required) {
    if (!parsed[field] || typeof parsed[field] !== 'string') {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }
  return parsed;
}

function validateWhatIf(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a JSON object');
  const required = ['scenarioSummary', 'likelyImpact', 'allocationEffect', 'considerations'];
  for (const field of required) {
    if (!parsed[field] || typeof parsed[field] !== 'string') {
      throw new Error(`Missing or invalid field: ${field}`);
    }
  }
  return parsed;
}

function safeParseJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// ── Generate explanations for portfolio findings ──────────────────────────────
/**
 * Takes structured findings from the rules engine and a portfolio context.
 * Returns natural-language explanations ONLY — no new findings, no scores.
 *
 * @param {Array}  findings        - Output from rulesEngine.runRules()
 * @param {Object} portfolioContext - Curated context for the LLM
 * @returns {Object} { portfolioSummary, explanations }
 */
async function generateFindingExplanations(findings, portfolioContext) {
  if (findings.length === 0) {
    return {
      portfolioSummary: 'Your portfolio is well-aligned with your target allocation. No significant issues were detected.',
      explanations: {},
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
You are a plain-English explanation engine for an Indian retail investor's portfolio intelligence system.

You will receive:
1. A structured portfolio context (facts computed by the application)
2. A list of structured findings (problems/observations identified by the rules engine)

Your ONLY job is to write clear, honest, jargon-free explanations for each finding.

STRICT RULES:
- Do NOT calculate new numbers. Use only the numbers provided in the evidence.
- Do NOT invent new findings. Only explain the findings given to you.
- Do NOT generate a score or rating.
- Do NOT say "you should buy X" or "you should sell Y".
- DO cite the exact numbers from the evidence (e.g., "your equity is 71%, your target is 60%").
- DO explain why this matters in simple terms.
- DO include a factual "what to consider" — not a directive.
- Write as if explaining to a first-time investor in India.
- Keep each explanation to 2-3 sentences maximum.

Return ONLY valid JSON. No markdown. No code fences. No extra text.

OUTPUT FORMAT:
{
  "portfolioSummary": "<2-sentence overview of the portfolio's health based on findings>",
  "explanations": {
    "<FINDING_TYPE>": "<explanation for that specific finding, citing evidence numbers>"
  }
}
`,
  });

  const findingTypes = findings.map(f => f.type);

  const message = `
Portfolio Context:
${JSON.stringify(portfolioContext, null, 2)}

Findings to explain (explain each type exactly once):
${JSON.stringify(findings, null, 2)}

Required explanation keys: ${findingTypes.join(', ')}
`;

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(message);
      const parsed = safeParseJson(result.response.text());
      return validateExplanations(parsed, findings);
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000)); // brief pause before retry
      }
    }
  }

  throw new Error(`AI explanation failed after 2 attempts: ${lastError.message}`);
}

// ── Holding explainer ─────────────────────────────────────────────────────────
/**
 * Produces a factual, grounded explanation for a single holding.
 * Does NOT infer user intent. States only what is observable and commonly true.
 *
 * @param {Object} holdingData       - Holding facts (name, type, category, weight, gain%)
 * @param {Object} portfolioSummary  - Basic portfolio context
 * @returns {Object} { whatItIs, commonUse, portfolioContribution, keyRisks, whatToMonitor }
 */
async function explainHolding(holdingData, portfolioSummary) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
You are an investment educator for Indian retail investors.
Explain the given holding factually, without inventing the investor's intent.

RULES:
- Do NOT say "you bought this for..." — you don't know why.
- DO say what this type of investment is and what it's commonly used for.
- DO cite the portfolio weight percentage from the provided data.
- Keep every field to 1-2 sentences.
- Return ONLY valid JSON. No markdown. No code fences.

OUTPUT FORMAT:
{
  "whatItIs": "<what this investment type/category is in plain terms>",
  "commonUse": "<what investors typically use this for — not what THIS investor intended>",
  "portfolioContribution": "<what it currently contributes to this portfolio, citing the weight %>",
  "keyRisks": "<the primary risk of this investment type>",
  "whatToMonitor": "<what the investor should periodically check for this holding>"
}
`,
  });

  const message = `Explain this holding:\n${JSON.stringify({ holdingData, portfolioSummary }, null, 2)}`;

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(message);
      const parsed = safeParseJson(result.response.text());
      return validateHoldingExplanation(parsed);
    } catch (err) {
      lastError = err;
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw new Error(`Holding explanation failed: ${lastError.message}`);
}

// ── What-if analysis ──────────────────────────────────────────────────────────
/**
 * Explains the implications of a hypothetical scenario.
 * Backend must pre-compute any numbers — AI explains the result.
 *
 * @param {Object} portfolioContext  - Current portfolio snapshot
 * @param {string} scenario          - Natural language scenario
 * @returns {Object} { scenarioSummary, likelyImpact, allocationEffect, considerations }
 */
async function analyzeWhatIf(portfolioContext, scenario) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
You are an AI explanation layer for an Indian portfolio intelligence system.
A user has described a hypothetical scenario. Explain its likely implications.

RULES:
- Focus on allocation shifts, not specific securities.
- Do NOT say "buy X" or "sell Y by name".
- Be honest when impact is uncertain — say so.
- Keep each field to 2-3 sentences.
- Return ONLY valid JSON. No markdown. No code fences.

OUTPUT FORMAT:
{
  "scenarioSummary": "<rephrase the scenario in your own clear words>",
  "likelyImpact": "<what would likely change in the portfolio>",
  "allocationEffect": "<how this might shift the asset allocation over time>",
  "considerations": "<things to evaluate before making this change>"
}
`,
  });

  const message = `
Portfolio Context:
${JSON.stringify(portfolioContext, null, 2)}

User scenario: "${scenario}"
`;

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(message);
      const parsed = safeParseJson(result.response.text());
      return validateWhatIf(parsed);
    } catch (err) {
      lastError = err;
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw new Error(`What-if analysis failed: ${lastError.message}`);
}

module.exports = { generateFindingExplanations, explainHolding, analyzeWhatIf };
