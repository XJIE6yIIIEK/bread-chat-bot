var Router = require('express');
var router = new Router();

const UserController = require('../../../core/objects/users/usersController');
const FavoritesController = require('../../../core/objects/favorites/favoritesController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', UserController.registration);

router.get('/user', UserController.get);

router.put('/:id/changePassword', UserController.changePassword);

router.post('/favorites/:n_candidate', FavoritesController.create);
router.delete('/favorites/:n_candidate', FavoritesController.delete);

module.exports = router;