const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/db.json');

const defaultData = {
  patients: [],
  appointments: [],
  pricingRules: [],
  costs: []
};

async function ensureDb() {
  const dataDir = path.dirname(DB_PATH);
  await fs.promises.mkdir(dataDir, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2));
  }
}

async function readDb() {
  await ensureDb();
  const content = await fs.promises.readFile(DB_PATH, 'utf-8');
  return JSON.parse(content);
}

async function writeDb(data) {
  await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function getCollection(collectionName) {
  const db = await readDb();
  return db[collectionName] || [];
}

async function saveCollection(collectionName, records) {
  const db = await readDb();
  db[collectionName] = records;
  await writeDb(db);
}

function getNextId(records) {
  if (!records.length) return 1;
  return Math.max(...records.map((item) => Number(item.id) || 0)) + 1;
}

module.exports = {
  ensureDb,
  getCollection,
  saveCollection,
  getNextId
};
