const AppError = require('../utils/appError');
const { isValidMonth } = require('../utils/date.utils');
const {
  sanitizeString,
  sanitizeOptionalString,
  isPositiveNumber
} = require('../utils/validation.utils');
const {
  getCollection,
  saveCollection,
  getNextId
} = require('../services/storage.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID invalido', 400);
  }
  return id;
}

function validateCostFields({ type, name, amount, referenceMonth }) {
  if (!['fixed', 'variable'].includes(type)) {
    throw new AppError('type deve ser fixed ou variable', 400);
  }

  if (!name) {
    throw new AppError('name e obrigatorio', 400);
  }

  if (!isPositiveNumber(amount)) {
    throw new AppError('amount deve ser um numero positivo', 400);
  }

  if (referenceMonth && !isValidMonth(referenceMonth)) {
    throw new AppError('referenceMonth deve estar no formato YYYY-MM', 400);
  }
}

async function createCost(req, res, next) {
  try {
    const type = sanitizeString(req.body.type).toLowerCase();
    const name = sanitizeString(req.body.name);
    const amount = Number(req.body.amount);
    const referenceMonth = sanitizeOptionalString(req.body.referenceMonth);

    validateCostFields({ type, name, amount, referenceMonth });

    const costs = await getCollection('costs');
    const now = new Date().toISOString();

    const cost = {
      id: getNextId(costs),
      type,
      name,
      amount,
      referenceMonth,
      createdAt: now,
      updatedAt: now
    };

    costs.push(cost);
    await saveCollection('costs', costs);

    res.status(201).json(cost);
  } catch (error) {
    next(error);
  }
}

async function listCosts(_req, res, next) {
  try {
    const costs = await getCollection('costs');
    res.json(costs);
  } catch (error) {
    next(error);
  }
}

async function getCostById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const costs = await getCollection('costs');
    const cost = costs.find((item) => item.id === id);

    if (!cost) throw new AppError('Custo nao encontrado', 404);

    res.json(cost);
  } catch (error) {
    next(error);
  }
}

async function updateCost(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const costs = await getCollection('costs');
    const index = costs.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Custo nao encontrado', 404);

    const current = costs[index];

    const type =
      req.body.type !== undefined
        ? sanitizeString(req.body.type).toLowerCase()
        : current.type;
    const name = req.body.name !== undefined ? sanitizeString(req.body.name) : current.name;
    const amount = req.body.amount !== undefined ? Number(req.body.amount) : current.amount;
    const referenceMonth =
      req.body.referenceMonth !== undefined
        ? sanitizeOptionalString(req.body.referenceMonth)
        : current.referenceMonth;

    validateCostFields({ type, name, amount, referenceMonth });

    const updated = {
      ...current,
      type,
      name,
      amount,
      referenceMonth,
      updatedAt: new Date().toISOString()
    };

    costs[index] = updated;
    await saveCollection('costs', costs);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteCost(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const costs = await getCollection('costs');
    const index = costs.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Custo nao encontrado', 404);

    const [removed] = costs.splice(index, 1);
    await saveCollection('costs', costs);

    res.json({ message: 'Custo removido com sucesso', cost: removed });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCost,
  listCosts,
  getCostById,
  updateCost,
  deleteCost
};
