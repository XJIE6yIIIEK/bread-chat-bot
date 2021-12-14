var Router = require('express');
var router = new Router();
const FormsController = require('../../../core/objects/forms/formsController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', FormsController.create);
router.get('/', FormsController.getAll);

router.post('/:id/general', FormsController.setGeneral);
router.delete('/:id/general', FormsController.deleteGeneral);

router.put('/:id', FormsController.patch);
router.delete('/:id', FormsController.delete);
router.get('/:id', FormsController.get);

module.exports = router;