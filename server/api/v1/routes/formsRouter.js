var Router = require('express');
var router = new Router();
const FormsController = require('../../../core/objects/forms/formsController');

router.post('/', FormsController.create);
router.get('/', FormsController.getAll);

router.patch('/:id', FormsController.patch);
router.delete('/:id', FormsController.delete);
router.get('/:id', FormsController.get);

module.exports = router;