const UserRepository = require('./usersRepository');
const AuthService = require('../../auth/authUtils');
const DBRepository = require('../../db/dbRepository');
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

    async get(userId){
        var user = await UserRepository.get({
            attributes: [
                's_name',
                'e_mail'
            ],
            where: {
                id: userId
            }
        });

        var favorites = await DBRepository.rawQuery(
            'SELECT t_candidates.id, t_candidates.s_name FROM t_favorites ' +
            'JOIN t_favorites ' +
            'ON t_favorites.n_candidate = t_candidates.id ' +
            'WHERE t_favorites.n_user = ' + userId + ' ' +
            'ORDER BY t_candidates.id ASC',
            'SELECT'
        );

        return {
            user: user,
            favorites: favorites
        };
    }
}

module.exports = new UserService();