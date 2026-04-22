const fs = require('fs');
const AppError = require('../utils/appError');
const { transcribeAudio } = require('../services/assemblyai.service');
const { runN8nAnalysis } = require('../services/n8n-analysis.service');

async function transcribe(req, res, next) {
  if (!req.file) {
    next(new AppError('Arquivo de audio e obrigatorio no campo audio', 400));
    return;
  }

  try {
    const result = await transcribeAudio(req.file.path);

    let analysis = null;
    let analysisError = null;

    try {
      analysis = await runN8nAnalysis({
        text: result.text,
        summary: result.summary,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      analysisError =
        error.response?.data?.message ||
        error.message ||
        'Falha ao processar analise no n8n';
    }

    res.json({
      ...result,
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
