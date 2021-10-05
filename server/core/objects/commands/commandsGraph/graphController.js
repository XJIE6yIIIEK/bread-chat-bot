var GraphService = require('./graphService');

class GraphController {
    async create(req, res, next){
        var data = req.body;
        var graph = await GraphService.create(data, next);
        return res.status(201).json(graph);
    }

    async delete(req, res, next){
        var edge = req.params;
        await GraphService.delete(edge, next);
        return res.status(203);
    }

    async get(req, res, next){
        var commandId = req.params.s_command;
        var graph = await GraphService.get(commandId);
        return res.status(200).json(graph);
    }

    async getAll(req, res, next){
        var graph = await GraphService.getAll(next);
        return res.status(200).json(graph);
    }
}

module.exports = new GraphController();