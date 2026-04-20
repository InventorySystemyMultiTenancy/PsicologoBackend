const express = require('express');
const cors = require('cors');
const env = require('./config/env');

const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const pricingRoutes = require('./routes/pricing.routes');
const costRoutes = require('./routes/cost.routes');
const reportRoutes = require('./routes/report.routes');
const transcriptionRoutes = require('./routes/transcription.routes');
const {
  notFoundMiddleware,
  errorMiddleware
} = require('./middlewares/error.middleware');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!env.corsOrigins.length || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem nao permitida pelo CORS'));
    }
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/pricing-rules', pricingRoutes);
app.use('/costs', costRoutes);
app.use('/', reportRoutes);
app.use('/', transcriptionRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
