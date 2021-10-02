var Router = require('express');
var router = new Router();
const ResumesController = require('../../../core/objects/resumes/resumesController');

router.post('/', ResumesController.create);
router.get('/:id', ResumesController.get);
router.get('/:id/:n_vacancy', ResumesController.getVacancyInfo);

module.exports = router;