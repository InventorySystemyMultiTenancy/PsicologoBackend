const app = require('./app');
const env = require('./config/env');
const { ensureDb } = require('./services/storage.service');

async function startServer() {
  try {
    await ensureDb();

    app.listen(env.port, () => {
      console.log(`API rodando na porta ${env.port}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
