const axios = require('axios');
const fs = require('fs');
const env = require('../config/env');
const AppError = require('../utils/appError');

const client = axios.create({
  baseURL: env.assemblyAiBaseUrl,
  headers: {
    authorization: env.assemblyAiApiKey
  },
  timeout: 120000
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadAudio(filePath) {
  if (!env.assemblyAiApiKey) {
    throw new AppError('ASSEMBLYAI_API_KEY nao configurada', 500);
  }

  const stream = fs.createReadStream(filePath);
  const response = await client.post('/upload', stream, {
    headers: {
      'content-type': 'application/octet-stream'
    },
    maxBodyLength: Infinity
  });

  return response.data.upload_url;
}

async function requestTranscription(audioUrl) {
  const payload = {
    audio_url: audioUrl,
    language_detection: env.assemblyAiLanguageDetection,
    ...(env.assemblyAiSpeechModels.length
      ? { speech_models: env.assemblyAiSpeechModels }
      : {}),
    summarization: true,
    summary_model: 'informative',
    summary_type: 'bullets'
  };

  const response = await client.post('/transcript', payload);
  return response.data.id;
}

async function waitForTranscription(transcriptId) {
  const maxAttempts = 40;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await client.get(`/transcript/${transcriptId}`);
    const data = response.data;

    if (data.status === 'completed') {
      return {
        text: data.text || '',
        summary: data.summary || ''
      };
    }

    if (data.status === 'error') {
      throw new AppError(
        data.error || 'Falha ao processar transcricao no AssemblyAI',
        400
      );
    }

    await delay(3000);
  }

  throw new AppError('Tempo limite excedido ao aguardar transcricao', 504);
}

async function transcribeAudio(filePath) {
  const audioUrl = await uploadAudio(filePath);
  const transcriptId = await requestTranscription(audioUrl);
  return waitForTranscription(transcriptId);
}

module.exports = {
  transcribeAudio
};
