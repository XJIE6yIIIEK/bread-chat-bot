var Router = require('express');
var router = new Router();

const AuthController = require('../../../core/auth/authController');

router.get('/', AuthController.authenticate);

module.exports = router;