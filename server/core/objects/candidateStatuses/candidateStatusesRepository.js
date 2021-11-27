const CandidateStatuses = require('./candidateStatusesModel');

class CandidateStatusesRepository {
    async get(conditions = {}) {
        var status = await CandidateStatuses.get(conditions);
        return status;
    }
}

module.exports = new CandidateStatusesRepository();