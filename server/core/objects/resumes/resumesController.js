var ResumesService = require('./resumesService');

class ResumesController {
    async get(req, res, next){
        var data = {
            userId: req.params.n_candidate,
            vacancyId: req.params.n_vacancy
        };
        var resume = await ResumesService.get(data, next);
        return res.status(200).json(resume).end();
    }

    async getAll(req, res, next){
        var userId = req.params.n_candidate;
        var resumes = await ResumesService.getAll(userId, next);
        return res.status(200).json(resumes).end();
    }
}

module.exports = new ResumesController();