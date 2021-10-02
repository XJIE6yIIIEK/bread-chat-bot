const VacanciesRepository = require('./vacanciesRepository');
const RequirementsRepository = require('../requirements/requirementsRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class VacanciesService {
    async create(data, next){
        const vacancy = await VacanciesRepository.create(data, next);        
        return vacancy;
    }

    async getAll(){
        const vacancies = await VacanciesRepository.getAll();
        return vacancies;
    }

    async update(data, next){
        var vacancy = await VacanciesRepository.get({
            where: {
                id: data.id
            }
        });

        if(!vacancy){
            return next(ErrorHandler.notFound('Вакансия с указанным ID не найдена'));
        }

        if(data.s_name){
            vacancy.s_name = data.s_name;
        }

        await VacanciesRepository.patch(vacancy);
    }

    async delete(id, next){
        var vacancy = await VacanciesRepository.get({
            where: {
                id: id
            }
        });

        await VacanciesRepository.delete(vacancy);
    }

    async get(vacancyId, next){
        var vacancy = await VacanciesRepository.get({
            where: {
                id: vacancyId
            }
        });

        if(!vacancy){
            return next(ErrorHandler.notFound('Вакансия с указанным ID не найдена'));
        }

        var requirements = await RequirementsRepository.getAll({
            where: {
                n_vacancy: vacancyId
            }
        });

        vacancy.requirements = requirements;
        return vacancy;
    }
}

module.exports = new VacanciesService();