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
  )
};

module.exports = env;
