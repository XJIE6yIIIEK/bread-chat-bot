const ErrorHandler = require('../../errorHandlers/errorHandler');
var FormToVacsService = require('./formToVacService');

class FormToVacsController {
    async create(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_form: req.params.n_form
        };
        var formToVac = await FormToVacsService.create(data, next);
        return res.status(200).json(formToVac).end();
    }

    async getAll(req, res, next){
        var vacancyId = req.params.n_vacancy;
        var formToVacs = await FormToVacsService.getAll(vacancyId, next);
        return res.status(200).json(formToVacs).end();
    }

    async delete(req, res, next){
        var data = {
            n_vacancy: req.params.n_vacancy,
            n_form: req.params.n_form
        };
        var result = await FormToVacsService.delete(data, next);
        
        if(result instanceof ErrorHandler){
            return next(result);
        }

        return res.status(204).end();
    }
}

module.exports = new FormToVacsController();