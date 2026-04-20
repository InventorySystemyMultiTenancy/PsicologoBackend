const AppError = require('../utils/appError');
const {
  sanitizeString,
  sanitizeOptionalString,
  isValidEmail
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

async function createPatient(req, res, next) {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const phone = sanitizeOptionalString(req.body.phone);
    const notes = sanitizeOptionalString(req.body.notes);

    if (!name) throw new AppError('name e obrigatorio', 400);
    if (!email) throw new AppError('email e obrigatorio', 400);
    if (!isValidEmail(email)) throw new AppError('email invalido', 400);

    const patients = await getCollection('patients');

    const existing = patients.find((item) => item.email === email);
    if (existing) {
      throw new AppError('Ja existe paciente com este email', 409);
    }

    const now = new Date().toISOString();
    const patient = {
      id: getNextId(patients),
      name,
      email,
      phone,
      notes,
      createdAt: now,
      updatedAt: now
    };

    patients.push(patient);
    await saveCollection('patients', patients);

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
}

async function listPatients(_req, res, next) {
  try {
    const patients = await getCollection('patients');
    res.json(patients);
  } catch (error) {
    next(error);
  }
}

async function getPatientById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const patients = await getCollection('patients');
    const patient = patients.find((item) => item.id === id);

    if (!patient) throw new AppError('Paciente nao encontrado', 404);

    res.json(patient);
  } catch (error) {
    next(error);
  }
}

async function updatePatient(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const patients = await getCollection('patients');
    const index = patients.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Paciente nao encontrado', 404);

    const current = patients[index];

    const name = req.body.name !== undefined ? sanitizeString(req.body.name) : current.name;
    const email =
      req.body.email !== undefined
        ? sanitizeString(req.body.email).toLowerCase()
        : current.email;
    const phone =
      req.body.phone !== undefined
        ? sanitizeOptionalString(req.body.phone)
        : current.phone;
    const notes =
      req.body.notes !== undefined
        ? sanitizeOptionalString(req.body.notes)
        : current.notes;

    if (!name) throw new AppError('name e obrigatorio', 400);
    if (!email) throw new AppError('email e obrigatorio', 400);
    if (!isValidEmail(email)) throw new AppError('email invalido', 400);

    const emailTaken = patients.some(
      (item) => item.email === email && item.id !== id
    );
    if (emailTaken) {
      throw new AppError('Ja existe paciente com este email', 409);
    }

    const updated = {
      ...current,
      name,
      email,
      phone,
      notes,
      updatedAt: new Date().toISOString()
    };

    patients[index] = updated;
    await saveCollection('patients', patients);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deletePatient(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const patients = await getCollection('patients');
    const index = patients.findIndex((item) => item.id === id);

    if (index === -1) throw new AppError('Paciente nao encontrado', 404);

    const appointments = await getCollection('appointments');
    const hasAppointments = appointments.some((item) => item.patientId === id);

    if (hasAppointments) {
      throw new AppError(
        'Nao e possivel excluir paciente com agendamentos vinculados',
        409
      );
    }

    const [removed] = patients.splice(index, 1);
    await saveCollection('patients', patients);

    res.json({ message: 'Paciente removido com sucesso', patient: removed });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
