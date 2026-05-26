function normalizePlate(plate) {
  return String(plate || '').trim().toUpperCase();
}

module.exports = { normalizePlate };
