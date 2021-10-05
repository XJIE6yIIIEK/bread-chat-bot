var Router = require('express');
var router = new Router();
const MessagesController = require('../../../core/objects/messages/messagesController');

router.get('/:s_tg_id', MessagesController.getAll);

module.exports = router;