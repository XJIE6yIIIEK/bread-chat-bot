var Router = require('express');
var router = new Router();
const GraphController = require('../../../core/objects/commands/commandsGraph/graphController');

router.post('/', GraphController.create);
router.get('/', GraphController.getAll);

router.delete('/:id', GraphController.delete);
router.get('/:id', GraphController.get);

module.exports = router;