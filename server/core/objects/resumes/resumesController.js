var ResumesService = require('./resumesService');

class ResumesController {
    async get(req, res, next){
        var data = {
            userId: req.params.n_user,
            vacancyId: req.params.n_vacancy
        };
        var resume = await ResumesService.get(data, next);
        return res.status(200).json(resume);
    }

    async getAll(req, res, next){
        var userId = req.params.n_user;
        var resumes = await ResumesService.getAll(userId, next);
        return res.status(200).json(resumes);
    }
}

module.exports = new ResumesController();