var Router = require('express');
var router = new Router();
const FormsController = require('../../../core/objects/forms/formsController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', AuthMiddleware, FormsController.create);
router.get('/', AuthMiddleware, FormsController.getAll);

router.post('/:id/general', AuthMiddleware, FormsController.setGeneral);
router.delete('/:id/general', AuthMiddleware, FormsController.deleteGeneral);

router.put('/:id', AuthMiddleware, FormsController.patch);
router.delete('/:id', AuthMiddleware, FormsController.delete);
router.get('/:id', AuthMiddleware, FormsController.get);

module.exports = router;