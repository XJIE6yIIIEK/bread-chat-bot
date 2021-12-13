var CommandsService = require('./commandsService');

class CommandsController {
    async create(req, res, next){
        var data = req.body;
        var command = await CommandsService.create(data, next);
        return res.status(201).json(command).end();
    }

    async patch(req, res, next){
        var data = req.body;
        data.id = req.params.id;
        await CommandsService.patch(data, next);
        return res.status(203).end();
    }

    async delete(req, res, next){
        var id = req.params.id;
        await CommandsService.delete(id, next);
        return res.status(203).end();
    }

    async get(req, res, next){
        var id = req.params.id;
        var command = await CommandsService.get(id, next);
        return res.status(200).json(command).end();
    }

    async getAll(req, res, next){
        var commands = await CommandsService.getAll(next);
        return res.status(200).json(commands).end();
    }
}

module.exports = new CommandsController();