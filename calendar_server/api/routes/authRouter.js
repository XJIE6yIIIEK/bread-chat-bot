var router = require('express-promise-router')();

const AuthController = require('../../core/auth/authController');

router.get('/signin', AuthController.authenticateRequest);
router.get('/callback', AuthController.authenticateResponse);

module.exports = router;