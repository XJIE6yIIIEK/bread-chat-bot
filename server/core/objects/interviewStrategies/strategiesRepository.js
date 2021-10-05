var Strategies = require('./commandsModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class StrategiesRepository {
    async create(data, next){
        try{
            var strategyElement = await Strategies.create(data);
            return strategyElement;
        } catch(e) {
            next(ErrorHandler.elementExist('Такая команда уже существует'));
        }
    }

    async getAll(conditions = {}){
        var strategy = await Strategies.findAll(conditions);
        return strategy;
    }

    async get(conditions = {}){
        var startegyElement = await Strategies.findOne(conditions);
        return startegyElement;
    }

    async delete(startegyElement){
        startegyElement.destroy();
    }
}

module.exports = new StrategiesRepository();