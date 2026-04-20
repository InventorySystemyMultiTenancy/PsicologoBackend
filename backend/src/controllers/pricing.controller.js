const AppError = require('../utils/appError');
const { isValidTime, toMinutes } = require('../utils/date.utils');
const { isPositiveNumber } = require('../utils/validation.utils');
const {
  getCollection,
  saveCollection,
  getNextId
} = require('../services/storage.service');
const { validatePricingRule } = require('../services/pricing.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID invalido', 400);
  }
  return id;
}

function hasOverlap(newRule, rules, ignoreId = null) {
  const newStart = toMinutes(newRule.startHour);
  const newEnd = toMinutes(newRule.endHour);

  return rules.some((rule) => {
    if (ignoreId && rule.id === ignoreId) return false;

    const start = toMinutes(rule.startHour);
    const end = toMinutes(rule.endHour);

    return newStart < end && newEnd > start;
  });
}

async function createPricingRule(req, res, next) {
  try {
    const { startHour, endHour, price } = req.body;

    if (!isValidTime(startHour) || !isValidTime(endHour)) {
      throw new AppError('startHour e endHour devem estar no formato HH:mm', 400);
    }

    if (!isPositiveNumber(price)) {
      throw new AppError('price deve ser um numero positivo', 400);
    }

    validatePricingRule({ startHour, endHour, price });

    const rules = await getCollection('pricingRules');

    if (hasOverlap({ startHour, endHour }, rules)) {
      throw new AppError('Regra sobrepoe outra faixa de preco existente', 409);
    }

    const now = new Date().toISOString();
    const rule = {
      id: getNextId(rules),
      startHour,
      endHour,
      price: Number(price),
      createdAt: now,
      updatedAt: now
    };

    rules.push(rule);
    await saveCollection('pricingRules', rules);

    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
}

async function listPricingRules(_req, res, next) {
  try {
    const rules = await getCollection('pricingRules');
    res.json(rules);
  } catch (error) {
    next(error);
  }
}

async function getPricingRuleById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const rules = await getCollection('pricingRules');
    const rule = rules.find((item) => item.id === id);

    if (!rule) throw new AppError('Regra de preco nao encontrada', 404);

    res.json(rule);
  } catch (error) {
    next(error);
  }
}

async function updatePricingRule(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const rules = await getCollection('pricingRules');
    const index = rules.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Regra de preco nao encontrada', 404);

    const current = rules[index];
    const startHour = req.body.startHour !== undefined ? req.body.startHour : current.startHour;
    const endHour = req.body.endHour !== undefined ? req.body.endHour : current.endHour;
    const price = req.body.price !== undefined ? req.body.price : current.price;

    if (!isValidTime(startHour) || !isValidTime(endHour)) {
      throw new AppError('startHour e endHour devem estar no formato HH:mm', 400);
    }

    if (!isPositiveNumber(price)) {
      throw new AppError('price deve ser um numero positivo', 400);
    }

    validatePricingRule({ startHour, endHour, price });

    if (hasOverlap({ startHour, endHour }, rules, id)) {
      throw new AppError('Regra sobrepoe outra faixa de preco existente', 409);
    }

    const updated = {
      ...current,
      startHour,
      endHour,
      price: Number(price),
      updatedAt: new Date().toISOString()
    };

    rules[index] = updated;
    await saveCollection('pricingRules', rules);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deletePricingRule(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const rules = await getCollection('pricingRules');
    const index = rules.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Regra de preco nao encontrada', 404);

    const [removed] = rules.splice(index, 1);
    await saveCollection('pricingRules', rules);

    res.json({ message: 'Regra removida com sucesso', rule: removed });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPricingRule,
  listPricingRules,
  getPricingRuleById,
  updatePricingRule,
  deletePricingRule
};
