var RequirementsService = require('./requirementsService');

class RequirementsController {
    async create(req, res, next){
        var data = req.body;
        var requirement = await RequirementsService.create(data, next);
        return res.status(201).json(requirement);
    }

    async patch(req, res, next){
        var data = req.body;
        data.n_vacancy = req.params.n_vacancy;
        data.s_name = req.params.s_name;
        await RequirementsService.patch(data, next);
        return res.status(203);
    }

    async delete(req, res, next){
        var requirement = req.params;
        await RequirementsService.delete(requirement, next);
        return res.status(203);
    }

    async get(req, res, next){
        var data = req.params;
        var requirement = await RequirementsService.get(data, next);
        return res.status(200).json(requirement);
    }

    async getAll(req, res, next){
        var vacancyId = req.params.n_vacancy;
        var requirements = await RequirementsService.getAll(vacancyId, next);
        return res.status(200).json(requirements);
    }
}

module.exports = new RequirementsController();