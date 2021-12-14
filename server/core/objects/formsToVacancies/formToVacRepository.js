var FormToVacs = require('./formToVacModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class FormToVacsRepository {
    async create(data){
        var formToVac = await FormToVacs.create(data);
        return formToVac;
    }

    async getAll(conditions = {}){
        var formToVacs = await FormToVacs.findAll(conditions);
        return formToVacs;
    }

    async get(conditions = {}){
        var formToVac = await FormToVacs.findOne(conditions);
        return formToVac;
    }

    async delete(formToVac){
        formToVac.destroy();
    }
}

module.exports = new FormToVacsRepository();