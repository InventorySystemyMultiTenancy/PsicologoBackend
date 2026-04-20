const AppError = require('../utils/appError');
const { isValidDate } = require('../utils/date.utils');
const { getCollection } = require('../services/storage.service');
const {
  calculateSummary,
  getRevenueByMonth,
  getCostsByCategory,
  getPeriodAnalysis
} = require('../services/finance.service');

async function getDashboard(_req, res, next) {
  try {
    const appointments = await getCollection('appointments');
    const costs = await getCollection('costs');

    const summary = calculateSummary(appointments, costs);

    res.json({
      grossProfit: summary.grossProfit,
      netProfit: summary.netProfit,
      totalCosts: summary.totalCosts,
      totalAppointments: summary.totalAppointments,
      revenueByMonth: getRevenueByMonth(appointments),
      costsByCategory: getCostsByCategory(costs)
    });
  } catch (error) {
    next(error);
  }
}

async function getReports(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      throw new AppError(
        'startDate e endDate sao obrigatorios no formato YYYY-MM-DD',
        400
      );
    }

    if (endDate < startDate) {
      throw new AppError('endDate nao pode ser menor que startDate', 400);
    }

    const appointments = await getCollection('appointments');
    const costs = await getCollection('costs');

    const summary = calculateSummary(appointments, costs, startDate, endDate);

    res.json({
      grossProfit: summary.grossProfit,
      netProfit: summary.netProfit,
      totalCosts: summary.totalCosts,
      periodAnalysis: getPeriodAnalysis(
        summary.filteredAppointments,
        summary.filteredCosts,
        startDate,
        endDate
      )
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getReports
};
