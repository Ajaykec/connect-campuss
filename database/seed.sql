-- Demo data. Run ONLY on an empty database (it inserts fixed rows every time it runs).
-- Project 1 already has one approved change applied: 5000 -> 5600, 2026-12-01 -> 2026-12-06.

INSERT INTO projects (project_name, client_name, original_scope, original_budget, original_deadline,
                      current_approved_budget, current_approved_deadline) VALUES
 ('Bakery Website', 'Sunrise Bakery', 'Five-page marketing site: home, menu, about, contact, gallery.', 5000, '2026-12-01', 5600, '2026-12-06'),
 ('Clinic Booking App', 'CityCare Clinic', 'Appointment booking form with email confirmation.', 8000, '2027-01-15', 8000, '2027-01-15');

INSERT INTO change_requests (project_id, description, reason, estimated_extra_cost, estimated_additional_days, status, decided_at) VALUES
 (1, 'Add online ordering page', 'Client wants customers to pre-order cakes.', 600, 5, 'approved', NOW()),
 (1, 'Add live chat widget', 'Client requested after launch meeting.', 300, 3, 'pending', NULL),
 (2, 'Add SMS reminders', 'Reduce no-shows.', 450, 4, 'rejected', NOW());

INSERT INTO audit_logs (project_id, change_request_id, action, details) VALUES
 (1, NULL, 'project_created',  'Project "Bakery Website" created with budget 5000 and deadline 2026-12-01.'),
 (1, 1,    'change_submitted', 'Change request submitted: Add online ordering page (+600 cost, +5 days)'),
 (1, 1,    'change_approved',  'Change request 1 approved: budget +600, deadline +5 days.'),
 (1, 2,    'change_submitted', 'Change request submitted: Add live chat widget (+300 cost, +3 days)'),
 (2, NULL, 'project_created',  'Project "Clinic Booking App" created with budget 8000 and deadline 2027-01-15.'),
 (2, 3,    'change_submitted', 'Change request submitted: Add SMS reminders (+450 cost, +4 days)'),
 (2, 3,    'change_rejected',  'Change request 3 rejected. Project terms unchanged.');
