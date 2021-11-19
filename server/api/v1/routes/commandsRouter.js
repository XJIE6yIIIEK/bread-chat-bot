var Router = require('express');
var router = new Router();
const CommandsController = require('../../../core/objects/commands/botCommands/commandsController');

router.post('/', CommandsController.create);
router.get('/', CommandsController.getAll);

router.update('/:s_name', CommandsController.patch);
router.delete('/:s_name', CommandsController.delete);
router.get('/:s_name', CommandsController.get);

module.exports = router;