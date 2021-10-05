var Router = require('express');
var router = new Router();
const ResumesController = require('../../../core/objects/resumes/resumesController');

router.get('/:n_user', ResumesController.getAll);
router.get('/:n_user/:n_vacancy', ResumesController.get);

module.exports = router;