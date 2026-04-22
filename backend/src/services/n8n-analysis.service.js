const axios = require('axios');
const env = require('../config/env');

async function runN8nAnalysis(payload) {
  if (!env.n8nAnalysisWebhookUrl) {
    return null;
  }

  const response = await axios.post(env.n8nAnalysisWebhookUrl, payload, {
    timeout: env.n8nAnalysisTimeoutMs,
    headers: {
      'content-type': 'application/json'
    }
  });

  return response.data;
}

module.exports = {
  runN8nAnalysis
};
