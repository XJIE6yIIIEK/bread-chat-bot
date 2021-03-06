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

        user.s_password = await AuthService.hashPass(credentials.s_password);

        await UserRepository.patch(user);
    }

    async get(userId){
        var user = await UserRepository.get({
            attributes: [
                's_name'
            ],
            where: {
                id: userId
            }
        });

        var favorites = await DBRepository.rawQuery(
            'SELECT t_candidates.id, t_candidates.s_name FROM t_favorites ' +
            'JOIN t_candidates ' +
            'ON t_favorites.n_candidate = t_candidates.id ' +
            `WHERE t_favorites.n_user = ${userId} ` +
            'ORDER BY t_candidates.id ASC',
            'SELECT'
        );

        var meetings = await DBRepository.rawQuery(
            'SELECT t_candidates.s_name, t_meeting_statuses.s_name AS s_status_name, t_vacancies.s_name AS s_vacancy_name, ' + 
            'to_char(t_meetings.d_date at time zone \'Europe/Moscow\', \'dd.MM.yyyy HH24:MI МСК\') AS d_date, ' + 
            't_meetings.n_candidate, t_meetings.n_vacancy ' +
            'FROM t_meetings ' +
            'JOIN t_meeting_statuses ' +
            'ON t_meeting_statuses.id = t_meetings.n_status ' +
            'JOIN t_candidates ' +
            'ON t_candidates.id = t_meetings.n_candidate ' +
            'JOIN t_vacancies ' +
            'ON t_vacancies.id = t_meetings.n_vacancy ' +
            `WHERE t_meetings.n_user = ${userId}`,
            'SELECT'
        );

        return {
            user,
            favorites,
            meetings
        };
    }
}

module.exports = new UserService();