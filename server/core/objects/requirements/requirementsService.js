var ErrorHandler = require('../../errorHandlers/errorHandler');
var RequirementsRepository = require('./requirementsRepository');

class RequirementsService {
    async create(data, next){
        var requirement = await RequirementsRepository.create(data);
        return requirement;
    }

    async patch(data, next){
        var requirement = await RequirementsRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                s_name: data.s_name
            }
        });

        if(!requirement){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        if(data.s_text){
            vacancy.s_text = data.s_text;
        }

        await RequirementsRepository.patch(requirement);
    }

    async delete(data, next){
        var requirement = await RequirementsRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                s_name: data.s_name
            }
        });

        if(!requirement){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        await RequirementsRepository.delete(requirement);
    }

    async get(data, next){
        var requirement = await RequirementsRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                s_name: data.s_name
            }
        });

        if(!requirement){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        return requirement;
    }

    async getAll(vacancyId, next){
        var requirements = await RequirementsRepository.getAll({
            where: {
                n_vacancy: vacancyId
            }
        });

        return requirements;
    }
}

module.exports = new RequirementsService();