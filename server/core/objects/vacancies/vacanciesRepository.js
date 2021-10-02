var Vacancies = require('./vacanciesModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class VacanciesRepository {
    async create(data, next){
        try{
            var vacancy = await Vacancies.create(data);
            return vacancy;
        } catch(e) {
            next(ErrorHandler.elementExist('Указанная вакансия уже содержится в базе'));
        }
    }

    async getAll(){
        var vacancies = await Vacancies.findAll();
        return vacancies;
    }

    async get(conditions = {}){
        var vacancy = await Vacancies.findOne(conditions);
        return vacancy;
    }

    async patch(vacancy){
        vacancy.save();
    }

    async delete(vacancy){
        vacancy.destroy();
    }
}

module.exports = new VacanciesRepository();