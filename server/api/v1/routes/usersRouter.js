var Router = require('express');
var router = new Router();

const UserController = require('../../../core/objects/users/usersController');
const FavoritesController = require('../../../core/objects/favorites/favoritesController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', UserController.registration);

router.get('/user', AuthMiddleware, UserController.get);

router.put('/changePassword', AuthMiddleware, UserController.changePassword);
router.put('/changePassword/:n_user', UserController.changePassword);

router.post('/favorites/:n_candidate', AuthMiddleware, FavoritesController.create);
router.delete('/favorites/:n_candidate', AuthMiddleware, FavoritesController.delete);

module.exports = router;