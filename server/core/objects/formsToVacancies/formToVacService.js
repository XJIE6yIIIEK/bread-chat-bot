const FormToVacsRepository = require('./formToVacRepository');
const BotTransmitterService = require('../../botHandler/botTransmitter/botTransmitterService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class FormToVacsService {
    async create(data){
        const formToVac = await FormToVacsRepository.create(data);
        
        BotTransmitterService.formToVacUpdated({
            formToVac: formToVac,
            delete: false
        });

        return formToVac;
    }

    async getAll(vacancyId){
        const formToVacs = await FormToVacsRepository.getAll({
            where:{
                n_vacancy: vacancyId
            }
        });
        return formToVacs;
    }

    async delete(data, next){
        var formToVac = await FormToVacsRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                n_form: data.n_form
            }
        });

        if(!formToVac){
            return next(ErrorHandler.notFound('Соединение не найдено'));
        }

        await BotTransmitterService.formToVacUpdated({
            formToVac: formToVac,
            delete: true
        });

        await FormToVacsRepository.delete(formToVac);
    }
}

module.exports = new FormToVacsService();