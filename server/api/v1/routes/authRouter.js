var Router = require('express');
var router = new Router();

const AuthController = require('../../../core/auth/authController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.get('/', AuthController.authenticate);
router.get('/check', AuthMiddleware, AuthController.check);
router.get('/logout', AuthMiddleware, AuthController.logout);

module.exports = router;