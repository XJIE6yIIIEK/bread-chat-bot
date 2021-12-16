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
            where: {
                s_login: credentials.s_login
            }
        });

        if(!user){
            return ErrorHandler.badRequest('Неверный email');
        }

        var passwordPassed = await AuthUtils.verifyPass(credentials.s_password, user.s_password);

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

    async logout(userId){
        var user = await UserRepository.get({
            where: {
                id: userId
            }
        });

        user.s_access_token = null;
        user.s_refresh_token = null;
        UserRepository.patch(user);
    }
}

module.exports = new AuthService();