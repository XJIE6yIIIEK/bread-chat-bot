const FormToVacsRepository = require('./formToVacRepository');
const BotTransmitterService = require('../../botHandler/botTransmitter/botTransmitterService');
const FormsService = require('../forms/formsService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class FormToVacsService {
    async create(data){
        const formToVac = await FormToVacsRepository.create(data);
        
        BotTransmitterService.formToVacUpdated({
            formToVac: formToVac,
            delete: false
        });

        await FormsService.deleteGeneral(formToVac.n_form);

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
        var formToVac;
        
        try{
            formToVac = await FormToVacsRepository.get({
                where: {
                    n_vacancy: data.n_vacancy,
                    n_form: data.n_form
                }
            });
        } catch(e) {
            return ErrorHandler.badRequest(
                'Неверные значения соответствия', 
                {
                    error: e.message,
                    requestValues: {
                        n_vacancy: data.n_vacancy,
                        n_form: data.n_form
                    }
                }
            );
        }

        if(!formToVac){
            return ErrorHandler.notFound('Соединение не найдено');
        }

        await BotTransmitterService.formToVacUpdated({
            formToVac: formToVac,
            delete: true
        });

        await FormToVacsRepository.delete(formToVac);
    }
}

module.exports = new FormToVacsService();