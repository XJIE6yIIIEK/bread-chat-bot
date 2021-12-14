const UserService = require('./usersService');
const ErrorHandler = require('../../errorHandlers/errorHandler');

class UserController {
    async registration(req, res, next){
        var credentials = req.body;
        var user = await UserService.registration(credentials);
        return res.status(200).json(user).end();
    }

    async changePassword(req, res, next){
        var credentials = {
            id: req.params.id,
            s_password: req.body.s_password
        };

        var user = await UserService.changePassword(credentials);
        if(user instanceof ErrorHandler) {
            return next(user);
        }

        return res.status(203).end();
    }

    async get(req, res, next){
        var userId = req.user.id;
        var user = await UserService.get(userId);
        return res.status(200).json(user).end();
    }
}

module.exports = new UserController();