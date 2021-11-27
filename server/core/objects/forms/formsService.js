var ErrorHandler = require('../../errorHandlers/errorHandler');
const BotTransmitterService = require('../../botHandler/botTransmitter/botTransmitterService');
var FormsRepository = require('./formsRepository');

class FormsService {
    async create(data, next){
        var form = await FormsRepository.create(data);

        BotTransmitterService.formUpdated(form);

        return form;
    }

    async patch(data, next){
        var form = await FormsRepository.get({
            where: {
                id: data.id
            }
        });

        if(!form){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        if(data.s_name){
            form.s_name = data.s_name;
        }

        BotTransmitterService.formUpdated(form);

        await FormsRepository.patch(form);
    }

    async delete(formId, next){
        var form = await FormsRepository.get({
            where: {
                id: formId
            }
        });

        if(!form){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        await BotTransmitterService.formUpdated(form);

        await FormsRepository.delete(form);
    }

    async get(formId, next){
        var requirement = await FormsRepository.get({
            where: {
                id: formId
            }
        });

        if(!requirement){
            return next(ErrorHandler.notFound('Требование не найдено'));
        }

        return requirement;
    }

    async getAll(next){
        var forms = await FormsRepository.getAll();

        return forms;
    }
}

module.exports = new FormsService();