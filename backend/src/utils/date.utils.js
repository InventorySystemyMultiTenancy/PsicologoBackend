function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isValidMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return false;
  const [year, month] = value.split('-').map(Number);
  return year >= 1900 && month >= 1 && month <= 12;
}

function toMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function getMonthKeyFromDate(dateStr) {
  return dateStr.slice(0, 7);
}

function createMonthSequence(startDate, endDate) {
  const result = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();

  while (year < end.getUTCFullYear() || (year === end.getUTCFullYear() && month <= end.getUTCMonth())) {
    result.push(`${year}-${String(month + 1).padStart(2, '0')}`);
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }

  return result;
}

function isDateInRange(dateStr, startDate, endDate) {
  return dateStr >= startDate && dateStr <= endDate;
}

module.exports = {
  isValidDate,
  isValidTime,
  isValidMonth,
  toMinutes,
  getMonthKeyFromDate,
  createMonthSequence,
  isDateInRange
};
