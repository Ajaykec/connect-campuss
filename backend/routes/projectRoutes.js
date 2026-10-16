const router = require('express').Router();
const wrap = require('./wrap');
const c = require('../controllers/projectController');
const { validateIdParam, validateBody, checkProject } = require('../middleware/validateRequest');

router.get('/', wrap(c.listProjects));
router.post('/', validateBody(checkProject), wrap(c.createProject));
router.get('/:id', validateIdParam, wrap(c.getProject));

module.exports = router;
