var CommandsService = require('./commandsService');

class CommandsController {
    async create(req, res, next){
        var data = req.body;
        var command = await CommandsService.create(data, next);
        return res.status(201).json(command);
    }

    async patch(req, res, next){
        var data = req.body;
        data.s_name = req.params.s_name;
        await CommandsService.patch(data, next);
        return res.status(203);
    }

    async delete(req, res, next){
        var s_name = req.params.s_name;
        await CommandsService.delete(s_name, next);
        return res.status(203);
    }

    async get(req, res, next){
        var s_name = req.params.s_name;
        var command = await CommandsService.get(s_name, next);
        return res.status(200).json(command);
    }

    async getAll(req, res, next){
        var commands = await CommandsService.getAll(next);
        return res.status(200).json(commands);
    }
}

module.exports = new CommandsController();