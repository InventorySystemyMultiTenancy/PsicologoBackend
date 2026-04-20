const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
  assemblyAiBaseUrl:
    process.env.ASSEMBLYAI_BASE_URL || 'https://api.assemblyai.com/v2'
};

module.exports = env;
