var Candidates = require('./candidatesModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CandidatesRepository {
    async create(data){
        var candidate = await Candidates.create(data);
        return candidate;
    }

    async patch(candidate){
        candidate.save();
    }

    async getAll(conditions = {}){
        var candidates = await Candidates.findAll(conditions);
        return candidates;
    }

    async get(conditions = {}){
        var candidate = await Candidates.findOne(conditions);
        return candidate;
    }

    async delete(candidate){
        candidate.destroy();
    }
}

module.exports = new CandidatesRepository();