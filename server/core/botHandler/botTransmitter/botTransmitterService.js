const BotTransmitter = require('./botTransmitter');

class BotTransmitterService {
    async infoUpdated(info){
        info = {
            s_name: info.s_name,
            s_message: info.s_message
        };

        BotTransmitter.infoUpdated(info);
    }

    async requirementUpdated(requirement){
        requirement = {
            id: requirement.id,
            s_name: requirement.s_name
        };

        BotTransmitter.requirementUpdated(requirement);
    }

    async vacancyUpdated(vacancy){
        vacancy = {
            id: vacancy.id,
            s_name: vacancy.s_name
        };

        BotTransmitter.vacancyUpdated(vacancy);
    }

    async reqToVacUpdated(object){
        var data = {
            vacancyRequirement: {
                n_vacancy: object.recToVac.n_vacancy,
                n_requirement: object.recToVac.n_requirement
            },
            delete: object.delete
        };

        BotTransmitter.reqToVacUpdated(data);
    }
}

module.exports = new BotTransmitterService();