const ResumesRepository = require('./resumesRepository');
const DBRepository = require('../../db/dbRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ResumesService {
    async getAll(userId, next){
        const resumes = await ResumesRepository.getAll({
            where: {
                n_candidate: userId
            }
        });
        return resumes;
    }

    async get(data, next){
        var resume = await DBRepository.rawQuery(
            'SELECT t_resumes.* FROM t_resumes ' +
            'JOIN t_form_to_vac ' +
            'ON t_resumes.n_form = t_form_to_vac.n_form ' +
            'WHERE t_form_to_vac.n_vacancy = ' + data.vacancyId + ' AND t_resumes.n_candidate = ' + data.userId,
            'SELECT'
        );

        if(!resume){
            return next(ErrorHandler.notFound('Резюме не найдено'));
        }

        return resume;
    }
}

module.exports = new ResumesService();