var ReqToVacs = require('./reqToVacModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ReqToVacsRepository {
    async create(data){
        var reqToVac = await ReqToVacs.create(data);
        return reqToVac;
    }

    async getAll(conditions = {}){
        var reqToVacs = await ReqToVacs.findAll(conditions);
        return reqToVacs;
    }

    async delete(reqToVac){
        reqToVac.destroy();
    }
}

module.exports = new ReqToVacsRepository();