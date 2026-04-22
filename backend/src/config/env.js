const dotenv = require('dotenv');

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

function parseCsv(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
  assemblyAiBaseUrl:
    process.env.ASSEMBLYAI_BASE_URL || 'https://api.assemblyai.com/v2',
  assemblyAiLanguageDetection: parseBoolean(
    process.env.ASSEMBLYAI_LANGUAGE_DETECTION,
    true
  ),
  assemblyAiSpeechModels: parseCsv(
    process.env.ASSEMBLYAI_SPEECH_MODELS || 'universal-3-pro,universal-2'
  ),
  n8nAnalysisWebhookUrl: process.env.N8N_ANALYSIS_WEBHOOK_URL || '',
  n8nAnalysisTimeoutMs: parseNumber(process.env.N8N_ANALYSIS_TIMEOUT_MS, 0)
};

module.exports = env;
