var Router = require('express');
var router = new Router();
const FormToVacsController = require('../../../core/objects/formsToVacancies/formToVacController');

router.post('/:n_vacancy/:n_form', FormToVacsController.create);
router.get('/:n_vacancy', FormToVacsController.getAll);
router.delete('/:n_vacancy/:n_form', FormToVacsController.delete);

module.exports = router;