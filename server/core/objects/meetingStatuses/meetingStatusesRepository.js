var MeetingStatuses = require('./meetingStatusesModel');

class MeetingStatusesRepository {
    async create(data){
        var status = await MeetingStatuses.create(data);
        return status;
    }

    async get(conditions = {}){
        var status = await MeetingStatuses.findOne(conditions);
        return status;
    }
}

module.exports = new MeetingStatusesRepository();