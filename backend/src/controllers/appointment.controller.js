const AppError = require('../utils/appError');
const { isValidDate, isValidTime } = require('../utils/date.utils');
const { sanitizeOptionalString } = require('../utils/validation.utils');
const {
  getCollection,
  saveCollection,
  getNextId
} = require('../services/storage.service');
const { getAppointmentValue } = require('../services/pricing.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID invalido', 400);
  }
  return id;
}

async function createAppointment(req, res, next) {
  try {
    const patientId = Number(req.body.patientId);
    const date = req.body.date;
    const time = req.body.time;
    const notes = sanitizeOptionalString(req.body.notes);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      throw new AppError('patientId invalido', 400);
    }

    if (!isValidDate(date)) {
      throw new AppError('date deve estar no formato YYYY-MM-DD', 400);
    }

    if (!isValidTime(time)) {
      throw new AppError('time deve estar no formato HH:mm', 400);
    }

    const patients = await getCollection('patients');
    const patientExists = patients.some((item) => item.id === patientId);
    if (!patientExists) {
      throw new AppError('Paciente nao encontrado', 404);
    }

    const pricingRules = await getCollection('pricingRules');
    const value = getAppointmentValue(time, pricingRules);

    const appointments = await getCollection('appointments');
    const now = new Date().toISOString();

    const appointment = {
      id: getNextId(appointments),
      patientId,
      date,
      time,
      value,
      notes,
      createdAt: now,
      updatedAt: now
    };

    appointments.push(appointment);
    await saveCollection('appointments', appointments);

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function listAppointments(_req, res, next) {
  try {
    const appointments = await getCollection('appointments');
    res.json(appointments);
  } catch (error) {
    next(error);
  }
}

async function getAppointmentById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const appointments = await getCollection('appointments');
    const appointment = appointments.find((item) => item.id === id);

    if (!appointment) throw new AppError('Agendamento nao encontrado', 404);

    res.json(appointment);
  } catch (error) {
    next(error);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const id = parseId(req.params.id);

    const appointments = await getCollection('appointments');
    const index = appointments.findIndex((item) => item.id === id);
    if (index === -1) throw new AppError('Agendamento nao encontrado', 404);

    const current = appointments[index];

    const patientId =
      req.body.patientId !== undefined
        ? Number(req.body.patientId)
        : current.patientId;
    const date = req.body.date !== undefined ? req.body.date : current.date;
    const time = req.body.time !== undefined ? req.body.time : current.time;
    const notes =
      req.body.notes !== undefined
        ? sanitizeOptionalString(req.body.notes)
        : current.notes;

    if (!Number.isInteger(patientId) || patientId <= 0) {
      throw new AppError('patientId invalido', 400);
    }

    if (!isValidDate(date)) {
      throw new AppError('date deve estar no formato YYYY-MM-DD', 400);
    }

    if (!isValidTime(time)) {
      throw new AppError('time deve estar no formato HH:mm', 400);
    }

    const patients = await getCollection('patients');
    const patientExists = patients.some((item) => item.id === patientId);
    if (!patientExists) {
      throw new AppError('Paciente nao encontrado', 404);
    }

    const pricingRules = await getCollection('pricingRules');
    const value = getAppointmentValue(time, pricingRules);

    const updated = {
      ...current,
      patientId,
      date,
      time,
      value,
      notes,
      updatedAt: new Date().toISOString()
    };

    appointments[index] = updated;
    await saveCollection('appointments', appointments);

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const id = parseId(req.params.id);

    const appointments = await getCollection('appointments');
    const index = appointments.findIndex((item) => item.id === id);
    if (index === -1) throw new AppError('Agendamento nao encontrado', 404);

    const [removed] = appointments.splice(index, 1);
    await saveCollection('appointments', appointments);

    res.json({ message: 'Agendamento removido com sucesso', appointment: removed });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
};
