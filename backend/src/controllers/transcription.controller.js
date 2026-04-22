const fs = require('fs');
const AppError = require('../utils/appError');
const { transcribeAudio } = require('../services/assemblyai.service');
const { runN8nAnalysis } = require('../services/n8n-analysis.service');
const env = require('../config/env');

async function transcribe(req, res, next) {
  if (!req.file) {
    next(new AppError('Arquivo de audio e obrigatorio no campo audio', 400));
    return;
  }

  try {
    const result = await transcribeAudio(req.file.path);

    let analysis = null;
    let analysisError = null;
    let analysisStatus = 'disabled';

    if (!env.n8nAnalysisWebhookUrl) {
      analysisError = 'N8N_ANALYSIS_WEBHOOK_URL nao configurada no backend';
    } else {
      analysisStatus = 'requested';

      try {
        analysis = await runN8nAnalysis({
          text: result.text,
          summary: result.summary,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          createdAt: new Date().toISOString()
        });

        if (analysis) {
          analysisStatus = 'completed';
        } else {
          analysisStatus = 'empty';
          analysisError =
            'Webhook do n8n respondeu sem dados de analise. Verifique o node Respond to Webhook.';
        }
      } catch (error) {
        analysisStatus = 'failed';
        analysisError =
          error.response?.data?.message ||
          error.message ||
          'Falha ao processar analise no n8n';
      }
    }

    res.json({
      ...result,
      analysisStatus,
      analysis,
      ...(analysisError ? { analysisError } : {})
    });
  } catch (error) {
    next(error);
  } finally {
    fs.promises.unlink(req.file.path).catch(() => null);
  }
}

module.exports = {
  transcribe
};
