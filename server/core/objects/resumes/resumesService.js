const ResumesRepository = require('./resumesRepository');
const Sequelize = require('../../db/db');
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

        var resume = await Sequelize.query(
            'SELECT t_resumes.* FROM t_resumes ' +
            'JOIN t_req_to_vac ' +
            'ON t_resumes.n_requirement = t_req_to_vac.n_requirement ' +
            'WHERE t_req_to_vac.n_vacancy = ' + data.vacancyId + ' AND t_resumes.n_candidate = ' + data.userId
        );

        if(!resume){
            return next(ErrorHandler.notFound('Резюме не найдено'));
        }

        return resume;
    }
}

module.exports = new ResumesService();