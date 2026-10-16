// Builds the Express app (kept separate from server.js so tests can import it).
const path = require('path');
const express = require('express');
const cors = require('cors');

const projectRoutes = require('./routes/projectRoutes');
const changeRequestRoutes = require('./routes/changeRequestRoutes');
const auditRoutes = require('./routes/auditRoutes');
const database = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', databaseConfigured: database.isConfigured() },
  });
});

app.use('/api/projects', projectRoutes);
app.use('/api/projects', auditRoutes); // GET /api/projects/:id/audit
app.use('/api', changeRequestRoutes);  // /projects/:id/changes and /changes/:id/approve|reject

// Serve the frontend from the same server, so the browser needs no CORS setup.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
