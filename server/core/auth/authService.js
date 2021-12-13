const AuthUtils = require('./authUtils');
const UserRepository = require('../objects/users/usersRepository');
const ErrorHandler = require('../errorHandlers/errorHandler');

class AuthService {
    async authenticate(credentials){
        if(!credentials.s_login){
            return ErrorHandler.badRequest('Отсутствует логин');
        }

        if(!credentials.s_password){
            return ErrorHandler.badRequest('Отсутствует пароль');
        }

        var user = await UserRepository.get({
            s_login: credentials.s_login
        });

        if(!user){
            return ErrorHandler.badRequest('Неверный email');
        }

        var passwordPassed = await AuthUtils.verifyPass(user.s_password, credentials.s_password);

        if(!passwordPassed){
            return ErrorHandler.badRequest('Неверный пароль');
        }

        var accessToken = await AuthUtils.generateToken({
                id: user.id
            },
            's_access_token',
            user.id
        );

        var refreshToken = await AuthUtils.generateToken(
            {},
            's_refresh_token',
            user.id
        );

        return {
            userId: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    }
}

module.exports = new AuthService();