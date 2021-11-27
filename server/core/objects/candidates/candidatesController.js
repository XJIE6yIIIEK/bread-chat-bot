var CandidatesService = require('./candidatesService');
const ErrorHandler = require('../../errorHandlers/errorHandler');

class CandidatesController {
    async delete(req, res, next){
        var candidateId = req.params.id;
        await CandidatesService.delete(candidateId, next);
        return res.status(203);
    }

    async get(req, res, next){
        var candidateId = req.params.id;
        const candidate = await CandidatesService.get(candidateId, req);
        if(candidate instanceof ErrorHandler){
            return next(candidate);
        }
        return res.status(200).json(candidate);
    }

    async getAll(req, res, next){
        var candidates = await CandidatesService.getAll(next);
        return res.status(200).json(candidates);
    }
}

module.exports = new CandidatesController();