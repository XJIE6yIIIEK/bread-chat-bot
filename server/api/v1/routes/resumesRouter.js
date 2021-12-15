var Router = require('express');
var router = new Router();
const ResumesController = require('../../../core/objects/resumes/resumesController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.get('/:n_candidate', AuthMiddleware, ResumesController.getAll);
router.get('/:n_candidate/:n_vacancy', AuthMiddleware, ResumesController.get);

module.exports = router;