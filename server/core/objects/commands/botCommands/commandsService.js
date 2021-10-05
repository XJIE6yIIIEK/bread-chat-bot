const CommandsRepository = require('./commandsRepository');
const GraphService = require('../commandsGraph/graphService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CommandsService {
    async create(data, next){
        const command = await CommandsRepository.create(data, next);        
        return command;
    }

    async getAll(next){
        const commands = await CommandsRepository.getAll();
        return commands;
    }

    async patch(data, next){
        var command = await CommandsRepository.get({
            where: {
                s_command: data.s_command
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Команда бота не найдена'));
        }

        if(data.s_name){
            command.s_name = data.s_name;
        }

        if(data.s_message){
            command.s_message = data.s_message;
        }

        await CommandsRepository.patch(command);
    }

    async delete(commandId, next){
        var command = await CommandsRepository.get({
            where: {
                s_command: commandId
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Команда бота не найдена'));
        }

        await CommandsRepository.delete(command);
    }

    async get(commandId, next){
        var command = await CommandsRepository.get({
            where: {
                id: commandId
            }
        });

        if(!command){
            return next(ErrorHandler.notFound('Команда бота не найдена'));
        }

        var graph = await GraphService.get(commandId);
        command.graph = graph;

        return command;
    }
}

module.exports = new CommandsService();