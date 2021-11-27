const VacanciesRepository = require('./vacanciesRepository');
const FormToVacsRepository = require('../formsToVacancies/formToVacRepository');
const BotTransmitterService = require('../../botHandler/botTransmitter/botTransmitterService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class VacanciesService {
    async create(data, next){
        const vacancy = await VacanciesRepository.create(data, next);
        
        BotTransmitterService.vacancyUpdated(vacancy);

        return vacancy;
    }

    async getAll(){
        const vacancies = await VacanciesRepository.getAll();
        return vacancies;
    }

    async patch(data, next){
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

        BotTransmitterService.vacancyUpdated(vacancy);

        await VacanciesRepository.patch(vacancy);
    }

    async delete(id, next){
        var vacancy = await VacanciesRepository.get({
            where: {
                id: id
            }
        });

        if(!vacancy){
            return next(ErrorHandler.notFound('Вакансия с указанным ID не найдена'));
        }

        await BotTransmitterService.vacancyUpdated(vacancy);

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

        var forms = await FormToVacsRepository.getAll({
            attributes: [
                'n_form'
            ],
            where: {
                n_vacancy: vacancyId
            }
        });

        vacancy.forms = forms;
        return vacancy;
    }
}

module.exports = new VacanciesService();