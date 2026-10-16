// Page logic. Each HTML page sets <body data-page="..."> and this file runs the matching function.
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const money = (n) => Number(n).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
const dateOnly = (d) => String(d).slice(0, 10);
const dateTime = (d) => (d ? new Date(d).toLocaleString() : '-');

// Always escape text from the server before putting it into innerHTML (prevents XSS).
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML;
}

function show(id, type, text) {
  const el = $(id);
  if (!el) return;
  el.className = text ? `msg ${type}` : '';
  el.textContent = text || '';
}

// ---------- Dashboard ----------
async function initDashboard() {
  async function load() {
    try {
      const projects = await api.listProjects();
      $('projects').innerHTML = projects.length
        ? projects.map((p) => `
          <div class="card">
            <h3><a href="project-details.html?id=${p.id}">${esc(p.project_name)}</a></h3>
            <div class="muted">Client: ${esc(p.client_name)}</div>
            <div class="terms">
              <span>Approved budget</span><strong>${money(p.current_approved_budget)}</strong>
              <span>Approved deadline</span><strong>${dateOnly(p.current_approved_deadline)}</strong>
            </div>
          </div>`).join('')
        : '<p class="muted">No projects yet. Create one below.</p>';
      show('page-msg', 'error', '');
    } catch (e) { show('page-msg', 'error', e.message); }
  }

  $('project-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = {
      project_name: $('project_name').value.trim(),
      client_name: $('client_name').value.trim(),
      original_scope: $('original_scope').value.trim(),
      original_budget: parseFloat($('original_budget').value),
      original_deadline: $('original_deadline').value,
    };
    const errors = validators.project(f);
    if (errors.length) return show('form-msg', 'error', errors.join(' '));
    try {
      await api.createProject(f);
      ev.target.reset();
      show('form-msg', 'success', 'Project created.');
      load();
    } catch (e) { show('form-msg', 'error', e.message); }
  });
  load();
}

// ---------- Project details ----------
async function initProjectDetails() {
  const id = params.get('id');
  if (!id) return show('page-msg', 'error', 'No project selected. Open a project from the dashboard.');
  $('add-change-link').href = `change-request.html?projectId=${encodeURIComponent(id)}`;

  async function load() {
    try {
      const [p, changes, audit] = await Promise.all([api.getProject(id), api.listChanges(id), api.getAudit(id)]);
      $('title').textContent = p.project_name;
      $('terms').innerHTML = `
        <span></span><strong>Original (locked)</strong>
        <span>Client</span><span>${esc(p.client_name)}</span>
        <span>Scope</span><span>${esc(p.original_scope)}</span>
        <span>Budget</span><span>${money(p.original_budget)}</span>
        <span>Deadline</span><span>${dateOnly(p.original_deadline)}</span>
        <span></span><strong>Currently approved</strong>
        <span>Budget</span><strong>${money(p.current_approved_budget)}</strong>
        <span>Deadline</span><strong>${dateOnly(p.current_approved_deadline)}</strong>`;

      $('changes').innerHTML = changes.length ? changes.map((c) => `
        <div class="card">
          <span class="badge ${c.status}">${c.status}</span>
          <strong>${esc(c.description)}</strong>
          <div class="muted">${esc(c.reason)}</div>
          <div>+${money(c.estimated_extra_cost)} and +${c.estimated_additional_days} day(s)</div>
          <div class="muted">Submitted ${dateTime(c.created_at)}${c.decided_at ? ` - decided ${dateTime(c.decided_at)}` : ''}</div>
          ${c.status === 'pending' ? `<div class="row">
            <button class="ok" data-action="approve" data-id="${c.id}">Approve</button>
            <button class="bad" data-action="reject" data-id="${c.id}">Reject</button></div>` : ''}
        </div>`).join('') : '<p class="muted">No change requests yet.</p>';

      $('audit').innerHTML = audit.length ? audit.map((a) => `
        <div class="card"><strong>${esc(a.action)}</strong> <span class="muted">${dateTime(a.created_at)}</span>
        <div>${esc(a.details)}</div></div>`).join('') : '<p class="muted">No audit entries.</p>';
    } catch (e) { show('page-msg', 'error', e.message); }
  }

  $('changes').addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;
    btn.disabled = true;
    try {
      if (btn.dataset.action === 'approve') await api.approveChange(btn.dataset.id);
      else await api.rejectChange(btn.dataset.id);
      show('page-msg', 'success', `Change request ${btn.dataset.action}d.`.replace('rejectd', 'rejected'));
    } catch (e) { show('page-msg', 'error', e.message); }
    load();
  });
  load();
}

// ---------- Change request form ----------
function initChangeRequest() {
  const projectId = params.get('projectId');
  if (!projectId) return show('page-msg', 'error', 'No project selected. Open a project first, then choose "New change request".');
  $('back-link').href = `project-details.html?id=${encodeURIComponent(projectId)}`;

  $('change-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = { description: $('description').value.trim(), reason: $('reason').value.trim() };
    const hours = $('estimated_hours').value;
    if (hours !== '') {
      f.estimated_hours = parseFloat(hours); // server calculates cost and days
    } else {
      f.estimated_extra_cost = parseFloat($('estimated_extra_cost').value);
      f.estimated_additional_days = parseInt($('estimated_additional_days').value, 10);
    }
    const errors = validators.change(f);
    if (errors.length) return show('form-msg', 'error', errors.join(' '));
    try {
      await api.submitChange(projectId, f);
      location.href = `project-details.html?id=${encodeURIComponent(projectId)}`;
    } catch (e) { show('form-msg', 'error', e.message); }
  });
}

const pages = { dashboard: initDashboard, 'project-details': initProjectDetails, 'change-request': initChangeRequest };
document.addEventListener('DOMContentLoaded', () => {
  const init = pages[document.body.dataset.page];
  if (init) init();
});
