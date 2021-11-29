const CandidateStatuses = require('./candidateStatusesModel');

class CandidateStatusesRepository {
    async get(conditions = {}) {
        var status = await CandidateStatuses.findOne(conditions);
        return status;
    }
}

module.exports = new CandidateStatusesRepository();