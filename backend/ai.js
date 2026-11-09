const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✏️ KEEP the model name that already works for you
const MODEL = 'gemini-3.8-flash';

async function generate(prompt, asJson) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: asJson ? { responseMimeType: 'application/json' } : undefined,
  });
  return response.text;
}

// Returns a parsed JSON object
async function askJSON(prompt) {
  const text = await generate(prompt, true);
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// Returns plain text
async function askText(prompt) {
  return (await generate(prompt, false)).trim();
}

// Roadmap details that the dataset doesn't contain
async function askAI(role, topSkills) {
  const skillsText =
    topSkills && topSkills.length
      ? `Real job-posting data shows these top skills: ${topSkills.map((s) => s.skill).join(', ')}.`
      : 'No dataset information is available for this role.';

  const prompt = `You are a career advisor. Target job: "${role}". ${skillsText}
Reply with ONLY valid JSON in exactly this shape:
{"summary":"...","education":["..."],"skills":["..."],"certifications":["..."],"steps":[{"title":"...","duration":"...","details":["..."]}],"projects":["..."],"salaryNote":"..."}
Give 4 to 6 steps ordered from basic to advanced.`;

  return askJSON(prompt);
}

module.exports = { askAI, askJSON, askText };
