// CALCULATION RULES - edit here (or via .env) to change how impact is estimated.
//   extra cost       = estimated hours x HOURLY_RATE
//   additional days  = ceil(estimated hours / WORKING_HOURS_PER_DAY)
// Days are calendar days added to the deadline (weekends are NOT skipped - a demo simplification).

function getRules() {
  return {
    hourlyRate: Number(process.env.HOURLY_RATE) || 50,
    workingHoursPerDay: Number(process.env.WORKING_HOURS_PER_DAY) || 6,
  };
}

function calculateImpact(estimatedHours, rules = getRules()) {
  const cost = Math.round(estimatedHours * rules.hourlyRate * 100) / 100;
  const days = Math.ceil(estimatedHours / rules.workingHoursPerDay);
  return { estimated_extra_cost: cost, estimated_additional_days: days };
}

// Uses hours if given; otherwise trusts the manual numbers.
function resolveImpact(body) {
  if (typeof body.estimated_hours === 'number') return calculateImpact(body.estimated_hours);
  return {
    estimated_extra_cost: body.estimated_extra_cost,
    estimated_additional_days: body.estimated_additional_days,
  };
}

module.exports = { getRules, calculateImpact, resolveImpact };
