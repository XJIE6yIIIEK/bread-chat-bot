var Router = require('express');
var router = new Router();
const FormToVacsController = require('../../../core/objects/formsToVacancies/formToVacController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/:n_vacancy/:n_form', AuthMiddleware, FormToVacsController.create);
router.get('/:n_vacancy', AuthMiddleware, FormToVacsController.getAll);
router.delete('/:n_vacancy/:n_form', AuthMiddleware, FormToVacsController.delete);

module.exports = router;