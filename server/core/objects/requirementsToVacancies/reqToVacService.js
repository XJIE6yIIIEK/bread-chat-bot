const ReqToVacsRepository = require('./reqToVacRepository');
const BotTransmitterService = require('../../botHandler/botTransmitter/botTransmitterService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ReqToVacsService {
    async create(data){
        const reqToVac = await ReqToVacsRepository.create(data);
        
        BotTransmitterService.reqToVacUpdated({
            reqToVac: reqToVac,
            delete: false
        });

        return reqToVac;
    }

    async getAll(vacancyId){
        const reqToVacs = await ReqToVacsRepository.getAll({
            where:{
                n_vacancy: vacancyId
            }
        });
        return reqToVacs;
    }

    async delete(data, next){
        var reqToVac = await ReqToVacsRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                n_requirement: data.n_requirement
            }
        });

        if(!reqToVac){
            return next(ErrorHandler.notFound('Соединение не найдено'));
        }

        await BotTransmitterService.reqToVacUpdated({
            reqToVac: reqToVac,
            delete: true
        });

        await ReqToVacsRepository.delete(reqToVac);
    }
}

module.exports = new ReqToVacsService();