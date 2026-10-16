const router = require('express').Router();
const wrap = require('./wrap');
const c = require('../controllers/changeRequestController');
const { validateIdParam, validateBody, checkChangeRequest } = require('../middleware/validateRequest');

router.post('/projects/:id/changes', validateIdParam, validateBody(checkChangeRequest), wrap(c.submitChange));
router.get('/projects/:id/changes', validateIdParam, wrap(c.listChanges));
router.post('/changes/:id/approve', validateIdParam, wrap(c.approve));
router.post('/changes/:id/reject', validateIdParam, wrap(c.reject));

module.exports = router;
