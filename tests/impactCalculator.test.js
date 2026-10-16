const test = require('node:test');
const assert = require('node:assert');
const { calculateImpact } = require('../backend/services/impactCalculator');

const rules = { hourlyRate: 50, workingHoursPerDay: 6 };

test('cost is hours x hourly rate', () => {
  assert.strictEqual(calculateImpact(10, rules).estimated_extra_cost, 500);
});

test('days round UP to whole days', () => {
  assert.strictEqual(calculateImpact(6, rules).estimated_additional_days, 1);
  assert.strictEqual(calculateImpact(7, rules).estimated_additional_days, 2);
});

test('fractional hours work', () => {
  const r = calculateImpact(2.5, rules);
  assert.strictEqual(r.estimated_extra_cost, 125);
  assert.strictEqual(r.estimated_additional_days, 1);
});
