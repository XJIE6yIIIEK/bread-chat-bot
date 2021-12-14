const CandidateStatuses = require('./candidateStatusesModel');

class CandidateStatusesRepository {
    async create(data){
        var status = await CandidateStatuses.create(data);
        return status;
    }

    async get(conditions = {}) {
        var status = await CandidateStatuses.findOne(conditions);
        return status;
    }
}

module.exports = new CandidateStatusesRepository();