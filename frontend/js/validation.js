// Browser-side checks for nicer messages. The backend validates again - never rely on this alone.
const validators = {
  project(f) {
    const e = [];
    if (!f.project_name) e.push('Project name is required.');
    if (!f.client_name) e.push('Client name is required.');
    if (!f.original_scope) e.push('Original scope is required.');
    if (!(f.original_budget >= 0) || Number.isNaN(f.original_budget)) e.push('Budget must be a number, 0 or more.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.original_deadline || '')) e.push('Pick a deadline date.');
    return e;
  },
  change(f) {
    const e = [];
    if (!f.description) e.push('Describe the change.');
    if (!f.reason) e.push('Give a reason.');
    if (f.estimated_hours !== undefined) {
      if (!(f.estimated_hours > 0)) e.push('Estimated hours must be more than 0.');
    } else {
      if (!(f.estimated_extra_cost >= 0)) e.push('Extra cost must be 0 or more.');
      if (!Number.isInteger(f.estimated_additional_days) || f.estimated_additional_days < 0) e.push('Extra days must be a whole number, 0 or more.');
    }
    return e;
  },
};
