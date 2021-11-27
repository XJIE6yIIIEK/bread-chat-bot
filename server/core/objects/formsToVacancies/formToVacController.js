var FormToVacsService = require('./formToVacService');

class FormToVacsController {
    async create(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_form: req.params.n_form
        };
        var formToVac = await FormToVacsService.create(data, next);
        return res.status(200).json(formToVac);
    }

    async getAll(req, res, next){
        var vacancyId = req.params.n_vacancy;
        var formToVacs = await FormToVacsService.getAll(vacancyId, next);
        return res.status(200).json(formToVacs);
    }

    async delete(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_form: req.params.n_form
        };
        await FormToVacsService.getAll(data, next);
        return res.status(204);
    }
}

module.exports = new FormToVacsController();