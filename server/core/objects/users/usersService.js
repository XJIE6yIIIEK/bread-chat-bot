const UserRepository = require('./usersRepository');
const AuthService = require('../../auth/authUtils');
const ErrorHandler = require('../../errorHandlers/errorHandler');

class UserService {
    async registration(credentials){
        credentials.s_password = await AuthService.hashPass(credentials.s_password);
        var user = await UserRepository.create(credentials);
        return user;
    }

    async changePassword(credentials){
        var user = await UserRepository.get({
            where: {
                id: credentials.id
            }
        });

        if(!user){
            return ErrorHandler.badRequest('Неверно указан id');
        }

        user.s_password = await AuthService.hashPass(user.s_password);

        await UserRepository.patch(user);
    }
}

module.exports = new UserService();