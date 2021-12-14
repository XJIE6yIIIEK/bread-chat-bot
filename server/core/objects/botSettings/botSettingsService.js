const VacanciesRepository = require('../vacancies/vacanciesRepository');
const FormsRepository = require('../forms/formsRepository');
const FormsToVacancies = require('../formsToVacancies/formToVacRepository');

class BotSettingsService {
    async get(){
        const _vacancies = await VacanciesRepository.getAll();
        var vacancies = [];

        for(var i = 0; i < _vacancies.length; i++){
            vacancies[i] = {
                id: _vacancies[i].id,
                s_name: _vacancies[i].s_name,
                forms: await FormsToVacancies.getAll({
                    where: {
                        n_vacancy: _vacancies[i].id
                    }
                })
            };
        }

        const forms = await FormsRepository.getAll();
        
        return {
            vacancies: vacancies,
            forms: forms
        };
    }
}

module.exports = new BotSettingsService();