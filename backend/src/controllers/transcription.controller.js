const fs = require('fs');
const AppError = require('../utils/appError');
const { transcribeAudio } = require('../services/assemblyai.service');

async function transcribe(req, res, next) {
  if (!req.file) {
    next(new AppError('Arquivo de audio e obrigatorio no campo audio', 400));
    return;
  }

  try {
    const result = await transcribeAudio(req.file.path);
    res.json(result);
  } catch (error) {
    next(error);
  } finally {
    fs.promises.unlink(req.file.path).catch(() => null);
  }
}

module.exports = {
  transcribe
};
