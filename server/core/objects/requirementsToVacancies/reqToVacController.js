var ReqToVacsService = require('./reqToVacService');

class ReqToVacsController {
    async create(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_requirement: req.params.n_requirement
        };
        var reqToVac = await ReqToVacsService.create(data, next);
        return res.status(200).json(reqToVac);
    }

    async getAll(req, res, next){
        var vacancyId = req.params.n_vacancy;
        var reqToVacs = await ReqToVacsService.getAll(vacancyId, next);
        return res.status(200).json(reqToVacs);
    }

    async delete(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_requirement: req.params.n_requirement
        };
        await ReqToVacsService.getAll(data, next);
        return res.status(204);
    }
}

module.exports = new ReqToVacsController();