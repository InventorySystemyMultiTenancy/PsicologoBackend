const AppError = require('../utils/appError');
const { toMinutes } = require('../utils/date.utils');

function validatePricingRule({ startHour, endHour, price }) {
  const start = toMinutes(startHour);
  const end = toMinutes(endHour);

  if (end <= start) {
    throw new AppError('endHour deve ser maior que startHour', 400);
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new AppError('price deve ser um numero positivo', 400);
  }
}

function findRuleForTime(time, rules) {
  const target = toMinutes(time);

  return rules.find((rule) => {
    const start = toMinutes(rule.startHour);
    const end = toMinutes(rule.endHour);
    return target >= start && target < end;
  });
}

function getAppointmentValue(time, rules) {
  const rule = findRuleForTime(time, rules);

  if (!rule) {
    throw new AppError(
      'Nao existe faixa de preco para o horario informado',
      400
    );
  }

  return Number(rule.price);
}

module.exports = {
  validatePricingRule,
  findRuleForTime,
  getAppointmentValue
};
