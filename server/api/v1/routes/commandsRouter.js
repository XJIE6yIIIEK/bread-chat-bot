var Router = require('express');
var router = new Router();
const CommandsController = require('../../../core/objects/commands/botCommands/commandsController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', CommandsController.create);
router.get('/', CommandsController.getAll);

router.put('/:id', CommandsController.patch);
router.delete('/:id', CommandsController.delete);
router.get('/:id', CommandsController.get);

module.exports = router;