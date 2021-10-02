var Router = require('express');
var router = new Router();
const RequirementsController = require('../../../core/objects/requirements/requirementsController');

router.post('/:n_vacancy', RequirementsController.create);
router.get('/:n_vacancy', RequirementsController.getAll);

router.patch('/:n_vacancy/:s_name', RequirementsController.patch);
router.delete('/:n_vacancy/:s_name', RequirementsController.delete);
router.get('/:n_vacancy/:s_name', RequirementsController.get);

module.exports = router;