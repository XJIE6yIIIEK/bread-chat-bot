var Router = require('express');
var router = new Router();

const UserController = require('../../../core/objects/users/usersController');

router.post('/', UserController.registration);
router.patch('/:id/changePassword', UserController.changePassword);

module.exports = router;