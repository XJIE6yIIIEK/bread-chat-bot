var FormsService = require('./formsService');

class FormsController {
    async create(req, res, next){
        var data = req.body;
        var form = await FormsService.create(data, next);
        return res.status(201).json(form);
    }

    async patch(req, res, next){
        var data = req.body;
        data.id = req.params.id;
        await FormsService.patch(data, next);
        return res.status(203);
    }

    async delete(req, res, next){
        var formId = req.params.id;
        await FormsService.delete(formId, next);
        return res.status(203);
    }

    async get(req, res, next){
        var formId = req.params.id;
        var form = await FormsService.get(formId, next);
        return res.status(200).json(form);
    }

    async getAll(req, res, next){
        var forms = await FormsService.getAll(next);
        return res.status(200).json(forms);
    }
}

module.exports = new FormsController();