var Router = require('express');
var router = new Router();

const UserController = require('../../../core/objects/users/usersController');
const FavoritesController = require('../../../core/objects/favorites/favoritesController');

router.post('/', UserController.registration);

router.get('/user', UserController.get);

router.patch('/:id/changePassword', UserController.changePassword);

routee.post('/favorites/:n_candidate', FavoritesController.create);
routee.delete('/favorites/:n_candidate', FavoritesController.delete);

module.exports = router;