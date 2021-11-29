const AuthUtils = require('./authUtils');
const UserRepository = require('../objects/users/usersRepository');
const ErrorHandler = require('../errorHandlers/errorHandler');

class AuthService {
    async authenticate(credentials){
        var user = await UserRepository.get({
            e_mail: credentials.e_mail
        });

        if(!user){
            return ErrorHandler.badRequest('Неверный email');
        }

        var passwordPassed = await AuthUtils.verifyPass(user.s_password, credentials.s_password);

        if(!passwordPassed){
            return ErrorHandler.badRequest('Неверный пароль');
        }

        var token = await AuthUtils.generateToken({
            id: user.id
        });

        return token;
    }
}

module.exports = new AuthService();