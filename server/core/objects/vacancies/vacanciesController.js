var VacanciesService = require('./vacanciesService');

class VacanciesController {
    async create(req, res, next){
        const data = req.body;
        const vacancy = await VacanciesService.create(data, next);
        return res.status(201).json(vacancy);
    }

    async getAll(req, res, next){
        const vacancies = await VacanciesService.getAll();
        return res.status(200).json(vacancies);
    }

    async update(req, res, next){
        var vacancy = req.body;
        vacancy.id = req.params.id;
        await VacanciesService.update(vacancy, next);
        return res.status(204);
    }

    async delete(req, res, next){
        var vacancyId = req.params.id;
        await VacanciesService.delete(vacancyId, next);
        return res.status(204);
    }

    async get(req, res, next){
        var vacancyId = req.params.id;
        var vacancy = await VacanciesService.get(vacancyId, next);
        return res.status(200).json(vacancy);
    }
}

module.exports = new VacanciesController();