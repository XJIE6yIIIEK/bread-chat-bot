const BotTransmitter = require('./botTransmitter');

class BotTransmitterService {
    async infoUpdated(info){
        info = {
            s_name: info.s_name,
            s_message: info.s_message
        };

        BotTransmitter.infoUpdated(info);
    }

    async formUpdated(form){
        form = {
            id: form.id,
            s_name: form.s_name
        };

        BotTransmitter.formUpdated(form);
    }

    async vacancyUpdated(vacancy){
        vacancy = {
            id: vacancy.id,
            s_name: vacancy.s_name
        };

        BotTransmitter.vacancyUpdated(vacancy);
    }

    async formToVacUpdated(object){
        var data = {
            vacancyRequirement: {
                n_vacancy: object.formToVac.n_vacancy,
                n_form: object.formToVac.n_form
            },
            delete: object.delete
        };

        BotTransmitter.formToVacUpdated(data);
    }
}

module.exports = new BotTransmitterService();