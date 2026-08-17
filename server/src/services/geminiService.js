// Member 1 - Google Gemini API Service Wrapper
// Used by: Module 1 Feature 1 (AI-Powered Issue Classification)
//          Module 2 Feature 1 (Interactive AI Troubleshooting Assistant)
//
// If GEMINI_API_KEY is not configured in the environment, this service
// automatically falls back to a deterministic rule-based engine so the
// features remain fully functional for local development/demo without
// requiring a live API key (same pattern used by cloudinary.js).

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const isConfigured = () => Boolean(GEMINI_API_KEY);

// Low-level call to the Gemini REST API. Returns raw text or throws.
const callGemini = async (prompt) => {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API returned an empty response.');
  return text;
};

// Attempts to parse a JSON object out of a model response, tolerating
// markdown code fences (```json ... ```) that Gemini sometimes adds.
const extractJson = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response.');
  return JSON.parse(cleaned.slice(start, end + 1));
};

// ---------------------------------------------------------------------
// Heuristic fallback engine (keyword based) - Module 1 Feature 1
// ---------------------------------------------------------------------
const CRITICAL_KEYWORDS = ['not turning on', "won't turn on", 'wont turn on', 'smoke', 'burning', 'water damage', 'liquid spill', 'security breach', 'hacked', 'data loss', 'blue screen', 'crashed', 'no internet', 'down', 'virus', 'ransomware'];
const MODERATE_KEYWORDS = ['slow', 'lag', 'overheating', 'battery drain', 'wifi drops', 'flickering', 'noisy', 'freeze', 'freezing', 'update stuck'];

const DEVICE_KEYWORDS = {
  Laptop: ['laptop', 'notebook', 'macbook'],
  Desktop: ['desktop', 'pc', 'cpu', 'motherboard', 'monitor'],
  Phone: ['phone', 'smartphone', 'android', 'iphone', 'mobile'],
  Printer: ['printer', 'print', 'cartridge', 'scanner'],
  Internet: ['wifi', 'internet', 'router', 'network', 'ethernet', 'broadband']
};

const detectDeviceCategory = (text, fallback) => {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(DEVICE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return fallback || 'Laptop';
};

const heuristicClassify = ({ description, deviceCategory }) => {
  const lower = (description || '').toLowerCase();

  let severity = 'Moderate';
  if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) severity = 'Critical';
  else if (MODERATE_KEYWORDS.some((k) => lower.includes(k))) severity = 'Moderate';
  else severity = 'Low';

  const complexity = severity === 'Critical' ? 'High' : severity === 'Moderate' ? 'Medium' : 'Low';

  let recommendedMethod = 'Live Chat';
  if (severity === 'Critical') recommendedMethod = 'Home Visit';
  else if (complexity === 'Medium') recommendedMethod = 'Video Call';

  const detectedCategory = detectDeviceCategory(lower, deviceCategory);
  const categoryPhrase = detectedCategory === 'Internet' ? 'an Internet connectivity issue' : `a ${detectedCategory.toLowerCase()} issue`;

  return {
    deviceCategory: detectedCategory,
    severity,
    complexity,
    recommendedMethod,
    reasoning: `Rule-based analysis detected keywords consistent with ${categoryPhrase} at "${severity.toLowerCase()}" severity. Recommending "${recommendedMethod}" as the most suitable support channel.`,
    source: 'heuristic-fallback'
  };
};

// ---------------------------------------------------------------------
// Heuristic fallback engine - Module 2 Feature 1 (Troubleshooting)
// ---------------------------------------------------------------------
const TROUBLESHOOT_STEPS = {
  Laptop: [
    'Hold the power button for 10 seconds to force a shutdown, then power it back on.',
    'Plug the charger in directly and check if the charging LED turns on.',
    'Try a hard reset: remove the battery (if removable) and hold power for 30 seconds.',
    'Boot into Safe Mode to check whether a recent software update is the cause.'
  ],
  Desktop: [
    'Check that the power cable is firmly connected at both the PSU and the wall socket.',
    'Listen for beep codes or fan spin on power-on to isolate a hardware fault.',
    'Reseat the RAM sticks and GPU if the machine powers on but shows no display.',
    'Boot into Safe Mode to rule out a driver or software conflict.'
  ],
  Phone: [
    'Force restart the device using the manufacturer-specific button combination.',
    'Check available storage — low storage often causes freezing and slowdowns.',
    'Update to the latest OS version from Settings > Software Update.',
    'Boot into Safe Mode to check whether a third-party app is causing the issue.'
  ],
  Printer: [
    'Check for paper jams and remove any obstruction in the paper tray.',
    'Confirm the printer is connected to the same network as your computer.',
    'Restart both the printer and the print spooler service on your computer.',
    'Reinstall or update the printer driver from the manufacturer website.'
  ],
  Internet: [
    'Restart your router and modem — unplug for 30 seconds, then plug back in.',
    'Check if other devices on the same network are also affected.',
    'Run a speed test to confirm whether the issue is speed or full outage.',
    'Check for an outage announcement from your Internet Service Provider.'
  ]
};

const RESOLVED_KEYWORDS = ['fixed', 'resolved', 'solved', 'working now', 'works now', 'it worked', 'that worked', 'all good', 'sorted', 'back to normal'];
const STILL_BROKEN_KEYWORDS = ['still', 'not working', "didn't work", 'did not work', 'no change', 'same issue', 'nope', 'still happening', 'still broken'];

const heuristicTroubleshoot = ({ deviceCategory, messages }) => {
  const steps = TROUBLESHOOT_STEPS[deviceCategory] || TROUBLESHOOT_STEPS.Laptop;
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = (userMessages[userMessages.length - 1]?.content || '').toLowerCase();

  // Only mark resolved when the customer's own words confirm it — never guess.
  const confirmedResolved =
    userMessages.length > 1 &&
    RESOLVED_KEYWORDS.some((k) => lastUserMessage.includes(k)) &&
    !STILL_BROKEN_KEYWORDS.some((k) => lastUserMessage.includes(k));

  if (confirmedResolved) {
    return {
      reply: "That's great to hear — glad the issue is fixed! Feel free to come back here anytime if it happens again.",
      resolved: true,
      suggestedFollowUp: null,
      source: 'heuristic-fallback'
    };
  }

  const turnIndex = Math.min(userMessages.length - 1, steps.length - 1);
  const outOfSteps = userMessages.length - 1 >= steps.length;

  if (outOfSteps) {
    return {
      reply: "We've been through all the standard troubleshooting steps for this issue and it doesn't look resolved yet. I'd recommend connecting with a technician so they can take a closer look.",
      resolved: false,
      suggestedFollowUp: null,
      source: 'heuristic-fallback'
    };
  }

  const step = steps[Math.max(turnIndex, 0)];
  return {
    reply: `Let's try this next step: ${step} Let me know if that changes anything.`,
    resolved: false,
    suggestedFollowUp: 'Did that step change anything about the issue?',
    source: 'heuristic-fallback'
  };
};

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

// Module 1 Feature 1: AI-Powered Issue Classification
export const classifyIssueWithAI = async ({ description, deviceCategory }) => {
  if (!isConfigured()) {
    return heuristicClassify({ description, deviceCategory });
  }

  try {
    const prompt = `You are an AI issue classification engine for a tech support platform.
Analyze the following customer-reported technical issue and respond with ONLY a raw JSON object
(no markdown fences, no extra text) with these exact keys:
{
  "deviceCategory": one of ["Laptop","Desktop","Phone","Printer","Internet"],
  "severity": one of ["Low","Moderate","Critical"],
  "complexity": one of ["Low","Medium","High"],
  "recommendedMethod": one of ["Live Chat","Video Call","Home Visit"],
  "reasoning": a short 1-2 sentence explanation
}

Reported device category (if provided by customer): ${deviceCategory || 'unknown'}
Issue description: """${description}"""`;

    const text = await callGemini(prompt);
    const parsed = extractJson(text);
    return { ...parsed, source: 'gemini' };
  } catch (err) {
    console.error('Gemini classification failed, using heuristic fallback:', err.message);
    return heuristicClassify({ description, deviceCategory });
  }
};

// Module 2 Feature 1: Interactive AI Troubleshooting Assistant
export const chatWithTroubleshootAssistant = async ({ deviceCategory, description, messages }) => {
  if (!isConfigured()) {
    return heuristicTroubleshoot({ deviceCategory, messages });
  }

  try {
    const history = messages
      .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'Customer'}: ${m.content}`)
      .join('\n');

    const prompt = `You are TechAid's AI troubleshooting assistant. A customer has a ${deviceCategory || 'device'} issue:
"${description || 'not specified'}"

Conversation so far:
${history}

Ask ONE short, relevant follow-up question or give ONE concrete troubleshooting step at a time.
Keep the reply under 60 words. Respond with ONLY a raw JSON object (no markdown fences):
{
  "reply": "your response text",
  "resolved": true or false (true only if the issue is very likely fixed),
  "suggestedFollowUp": "a short follow-up question, or null if resolved"
}`;

    const text = await callGemini(prompt);
    const parsed = extractJson(text);
    return { ...parsed, source: 'gemini' };
  } catch (err) {
    console.error('Gemini troubleshooting failed, using heuristic fallback:', err.message);
    return heuristicTroubleshoot({ deviceCategory, messages });
  }
};

export const isGeminiConfigured = isConfigured;
