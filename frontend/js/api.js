// All communication with the Express backend lives here.
// Every function returns the "data" part of the response or throws an Error with a readable message.
const API_BASE = '/api'; // works because Express serves this frontend. Change to 'http://localhost:3000/api' if you host it elsewhere.

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (e) {
    throw new Error('Cannot reach the server. Is it running (npm start)?');
  }
  let body = null;
  try { body = await response.json(); } catch (e) { /* not JSON */ }
  if (!response.ok || !body || body.success === false) {
    const err = (body && body.error) || {};
    const details = err.details ? ' ' + err.details.join(' ') : '';
    throw new Error((err.message || `Request failed (${response.status})`) + details);
  }
  return body.data;
}

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data || {}) });

const api = {
  health: () => request('/health'),
  listProjects: () => request('/projects'),
  createProject: (data) => post('/projects', data),
  getProject: (id) => request(`/projects/${id}`),
  listChanges: (projectId) => request(`/projects/${projectId}/changes`),
  submitChange: (projectId, data) => post(`/projects/${projectId}/changes`, data),
  approveChange: (id) => post(`/changes/${id}/approve`),
  rejectChange: (id) => post(`/changes/${id}/reject`),
  getAudit: (projectId) => request(`/projects/${projectId}/audit`),
};
