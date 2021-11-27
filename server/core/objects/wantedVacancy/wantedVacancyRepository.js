var WantedVacancies = require('./wantedVacancyModel');


class WantedVacanciesRepository {
    async create(data){
        var wantedVacancy = await WantedVacancies.create(data);
        return wantedVacancy;
    }

    async get(conditions = {}){
        var wantedVacancy = await WantedVacancies.findOne(conditions);
        return wantedVacancy;
    }
}  

module.exports = new WantedVacanciesRepository();