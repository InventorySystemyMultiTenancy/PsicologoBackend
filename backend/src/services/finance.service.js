const {
  createMonthSequence,
  getMonthKeyFromDate,
  isDateInRange,
  isValidDate
} = require('../utils/date.utils');

function filterAppointmentsByPeriod(appointments, startDate, endDate) {
  if (!startDate || !endDate) return appointments;
  return appointments.filter((item) => isDateInRange(item.date, startDate, endDate));
}

function filterCostsByPeriod(costs, startDate, endDate) {
  if (!startDate || !endDate) return costs;

  return costs.filter((item) => {
    if (!item.referenceMonth) return true;
    const monthStart = `${item.referenceMonth}-01`;
    const monthEnd = `${item.referenceMonth}-31`;
    return monthEnd >= startDate && monthStart <= endDate;
  });
}

function calculateSummary(appointments, costs, startDate, endDate) {
  const filteredAppointments = filterAppointmentsByPeriod(
    appointments,
    startDate,
    endDate
  );
  const filteredCosts = filterCostsByPeriod(costs, startDate, endDate);

  const grossProfit = filteredAppointments.reduce(
    (acc, item) => acc + Number(item.value || 0),
    0
  );

  const totalCosts = filteredCosts.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  return {
    grossProfit,
    totalCosts,
    netProfit: grossProfit - totalCosts,
    totalAppointments: filteredAppointments.length,
    filteredAppointments,
    filteredCosts
  };
}

function getRevenueByMonth(appointments) {
  const map = new Map();

  appointments.forEach((item) => {
    if (!isValidDate(item.date)) return;
    const month = getMonthKeyFromDate(item.date);
    map.set(month, (map.get(month) || 0) + Number(item.value || 0));
  });

  return Array.from(map.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function getCostsByCategory(costs) {
  const map = new Map();

  costs.forEach((item) => {
    const key = item.type || 'other';
    map.set(key, (map.get(key) || 0) + Number(item.amount || 0));
  });

  return Array.from(map.entries()).map(([category, amount]) => ({
    category,
    amount
  }));
}

function getPeriodAnalysis(appointments, costs, startDate, endDate) {
  const months = createMonthSequence(startDate, endDate);

  return months.map((month) => {
    const monthAppointments = appointments.filter((item) =>
      item.date.startsWith(month)
    );

    const monthCosts = costs.filter((item) => {
      if (!item.referenceMonth) return false;
      return item.referenceMonth === month;
    });

    const grossProfit = monthAppointments.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0
    );

    const totalCosts = monthCosts.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    return {
      month,
      grossProfit,
      totalCosts,
      netProfit: grossProfit - totalCosts,
      totalAppointments: monthAppointments.length
    };
  });
}

module.exports = {
  calculateSummary,
  getRevenueByMonth,
  getCostsByCategory,
  getPeriodAnalysis
};
