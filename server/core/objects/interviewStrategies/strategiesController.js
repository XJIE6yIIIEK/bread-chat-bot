var StrategiesService = require('./commandsService');

class StartegiesController {
    async create(req, res, next){
        var data = req.body;
        var strategy = await StrategiesService.create(data, next);
        return res.status(201).json(strategy);
    }

    async delete(req, res, next){
        var strategyElementData = req.params;
        await StrategiesService.delete(strategyElementData, next);
        return res.status(203);
    }

    async get(req, res, next){
        var strategyElementData = req.params;
        var strategyElement = await StrategiesService.get(strategyElementData, next);
        return res.status(200).json(strategyElement);
    }

    async getAll(req, res, next){
        var vacancyId = req.params.n_vacancy
        var startegy = await StrategiesService.getAll(vacancyId, next);
        return res.status(200).json(startegy);
    }
}

module.exports = new StartegiesController();