const express = require('express');
const {
  createPricingRule,
  listPricingRules,
  getPricingRuleById,
  updatePricingRule,
  deletePricingRule
} = require('../controllers/pricing.controller');

const router = express.Router();

router.post('/', createPricingRule);
router.get('/', listPricingRules);
router.get('/:id', getPricingRuleById);
router.put('/:id', updatePricingRule);
router.delete('/:id', deletePricingRule);

module.exports = router;
