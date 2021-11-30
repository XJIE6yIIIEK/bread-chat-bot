const UserService = require('./usersService');
const ErrorHandler = require('../../errorHandlers/errorHandler');

class UserController {
    async registration(req, res, next){
        var credentials = req.body;
        var user = await UserService.registration(credentials);
        return res.status(200).json(user);
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

        return res.status(203);
    }

    async get(req, res, next){
        var userId = req.user.id;
        var user = await UserService.get(userId);
        return res.status(200).json(user);
    }
}

module.exports = new UserController();