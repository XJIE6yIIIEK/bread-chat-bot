const ResumesRepository = require('./resumesRepository');
const Sequelize = require('../../db/db');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ResumesService {
    async getAll(userId, next){
        const resumes = await ResumesRepository.getAll({
            attributes: [
                'n_candidate',
                [Sequelize.fn('DISTINCT', Sequelize.col('n_vacancy'), 'n_vacancy')]
            ],
            where: {
                n_candidate: userId
            }
        });
        return resumes;
    }

    async get(data, next){
        var resume = await ResumesRepository.getAll({
            where: {
                n_candidate: data.userId,
                n_vacancy: data.vacancyId
            }
        });

        if(!resume){
            return next(ErrorHandler.notFound('Резюме не найдено'));
        }

        return resume;
    }
}

module.exports = new ResumesService();