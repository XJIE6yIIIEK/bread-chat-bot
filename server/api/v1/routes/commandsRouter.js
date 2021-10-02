var Router = require('express');
var router = new Router();
const CommandsController = require('../../../core/objects/commands/botCommands/commandsController');

router.post('/', CommandsController.create);
router.get('/', CommandsController.getAll);

router.update('/:id', CommandsController.update);
router.delete('/:id', CommandsController.delete);
router.get('/:id', CommandsController.get);

module.exports = router;