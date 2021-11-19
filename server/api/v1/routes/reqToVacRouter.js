var Router = require('express');
var router = new Router();
const ReqToVacsController = require('../../../core/objects/requirementsToVacancies/reqToVacController');

router.post('/:n_vacancy/:n_requirement', ReqToVacsController.create);
router.get('/:n_vacancy', ReqToVacsController.getAll);
router.delete('/:n_vacancy/:n_requirement', ReqToVacsController.delete);

module.exports = router;