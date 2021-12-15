var Router = require('express');
var router = new Router();
const BotSettingsController = require('../../../core/objects/botSettings/botSettingsController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.get('/', AuthMiddleware, BotSettingsController.get);

module.exports = router;