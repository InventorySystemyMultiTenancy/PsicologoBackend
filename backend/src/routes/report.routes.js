const express = require('express');
const { getDashboard, getReports } = require('../controllers/report.controller');

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/reports', getReports);

module.exports = router;
