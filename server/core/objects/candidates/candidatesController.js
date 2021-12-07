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
        req.user = {
            id: 1
        };
        const candidate = await CandidatesService.get(candidateId, req.user.id);
        if(candidate instanceof ErrorHandler){
            return next(candidate);
        }
        return res.status(200).json(candidate);
    }

    async getAll(req, res, next){
        res.header('Access-Control-Expose-Headers', 'Location');
        res.header('Location', req.header('Origin') + '/index.html');
        req.user = {
            id: 1
        };
        var candidates = await CandidatesService.getAll(req.user.id);
        return res.status(200).json(candidates);
    }
}

module.exports = new CandidatesController();