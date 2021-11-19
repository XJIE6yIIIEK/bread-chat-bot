var Commands = require('./commandsModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CommandsRepository {
    async create(data, next){
        try{
            var command = await Commands.create(data);
            return command;
        } catch(e) {
            next(ErrorHandler.elementExist('Такая команда уже существует'));
        }
    }

    async getAll(conditions = {}){
        var commands = await Commands.findAll(conditions);
        return commands;
    }

    async get(conditions = {}){
        var command = await Commands.findOne(conditions);
        return command;
    }

    async patch(command){
        command.save();
    }

    async delete(command){
        command.destroy();
    }
}

module.exports = new CommandsRepository();