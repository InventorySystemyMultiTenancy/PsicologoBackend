const express = require('express');
const {
  createCost,
  listCosts,
  getCostById,
  updateCost,
  deleteCost
} = require('../controllers/cost.controller');

const router = express.Router();

router.post('/', createCost);
router.get('/', listCosts);
router.get('/:id', getCostById);
router.put('/:id', updateCost);
router.delete('/:id', deleteCost);

module.exports = router;
