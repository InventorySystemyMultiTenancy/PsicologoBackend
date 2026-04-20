const express = require('express');
const {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient
} = require('../controllers/patient.controller');

const router = express.Router();

router.post('/', createPatient);
router.get('/', listPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;
