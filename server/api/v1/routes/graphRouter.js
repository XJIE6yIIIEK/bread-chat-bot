var Router = require('express');
var router = new Router();
const GraphController = require('../../../core/objects/commands/commandsGraph/graphController');

router.post('/', GraphController.create);
router.get('/', GraphController.getAll);

router.delete('/:s_fc/:s_sc', GraphController.delete);
router.get('/:s_command', GraphController.get);

module.exports = router;