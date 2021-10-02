var Router = require('express');
var router = new Router();
const MessagesController = require('../../../core/objects/messages/messagesController');

router.get('/:n_user', MessagesController.getAll);

module.exports = router;