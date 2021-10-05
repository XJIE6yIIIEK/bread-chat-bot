const StrategiesRepository = require('./commandsRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class StrategiesService {
    async create(data, next){
        const strategyElement = await StrategiesRepository.create(data, next);        
        return strategyElement;
    }

    async getAll(vacancyId, next){
        const strategy = await StrategiesRepository.getAll({
            where: {
                n_vacancy: vacancyId
            }
        });
        return strategy;
    }

    async delete(data, next){
        var strategyElement = await StrategiesRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                n_serial: data.n_serial
            }
        });

        if(!strategyElement){
            return next(ErrorHandler.notFound('Элемент стратегии не найден'));
        }

        await StrategiesRepository.delete(strategyElement);
    }

    async get(data, next){
        var strategyElement = await StrategiesRepository.get({
            where: {
                n_vacancy: data.n_vacancy,
                n_serial: data.n_serial
            }
        });

        if(!strategyElement){
            return next(ErrorHandler.notFound('Элемент стратегии не найден'));
        }

        return strategyElement;
    }
}

module.exports = new StrategiesService();