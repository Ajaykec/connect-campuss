const router = require('express').Router();
const wrap = require('./wrap');
const { getAudit } = require('../controllers/auditController');
const { validateIdParam } = require('../middleware/validateRequest');

router.get('/:id/audit', validateIdParam, wrap(getAudit));

module.exports = router;
