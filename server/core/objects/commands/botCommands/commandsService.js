const CommandsRepository = require('./commandsRepository');
const BotTransmitterService = require('../../../botHandler/botTransmitter/botTransmitterService');
var ErrorHandler = require('../../../errorHandlers/errorHandler');

class CommandsService {
    async create(data, next){
        const command = await CommandsRepository.create(data, next);

        BotTransmitterService.infoUpdated(command);

        return command;
    }

    async getAll(next){
        const commands = await CommandsRepository.getAll();
        return commands;
    }

    async patch(data, next){
        var command = await CommandsRepository.get({
            where: {
                s_name: data.s_name
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Информация не найдена'));
        }

        if(data.s_name){
            command.s_name = data.s_name;
        }

        if(data.s_message){
            command.s_message = data.s_message;
        }

        BotTransmitterService.infoUpdated(command);

        await CommandsRepository.patch(command);
    }

    async delete(s_name, next){
        var command = await CommandsRepository.get({
            where: {
                s_name: s_name
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Информация не найдена'));
        }

        await BotTransmitterService.infoUpdated({
            s_name: command.s_name
        });

        await CommandsRepository.delete(command);
    }

    async get(s_name, next){
        var command = await CommandsRepository.get({
            where: {
                s_name: s_name
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Информация не найдена'));
        }

        return command;
    }
}

module.exports = new CommandsService();