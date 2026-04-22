const axios = require('axios');
const env = require('../config/env');

function tryParseJsonString(value) {
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function normalizeAnalysisPayload(data) {
  if (data == null) return null;

  if (Array.isArray(data)) {
    if (!data.length) return null;
    return normalizeAnalysisPayload(data[0]);
  }

  if (typeof data === 'string') {
    const parsed = tryParseJsonString(data);
    return parsed || { text: data };
  }

  if (typeof data === 'object') {
    const candidates = [
      data.analysis,
      data.data,
      data.output,
      data.response,
      data.result,
      data.message
    ];

    for (const candidate of candidates) {
      const normalized = normalizeAnalysisPayload(candidate);
      if (normalized) return normalized;
    }

    return data;
  }

  return { value: data };
}

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

  return normalizeAnalysisPayload(response.data);
}

module.exports = {
  runN8nAnalysis
};
