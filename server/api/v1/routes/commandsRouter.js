var Router = require('express');
var router = new Router();
const CommandsController = require('../../../core/objects/commands/botCommands/commandsController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', AuthMiddleware, CommandsController.create);
router.get('/', AuthMiddleware,  CommandsController.getAll);

router.put('/:id', AuthMiddleware, CommandsController.patch);
router.delete('/:id', AuthMiddleware, CommandsController.delete);
router.get('/:id', AuthMiddleware, CommandsController.get);

module.exports = router;