const CalendarTransmitter = require('./calendarTransmitter');

class CalendarTransmitterService {
    async createNewMeeting(userId, meetingData, callback){
        var meetingPayload = {
            startDate: meetingData.startDate,
            endDate: meetingData.endDate,
            duration: meetingData.duration,
            userId: userId
        }

        await CalendarTransmitter.findMeetingTime(meetingPayload, callback);
    }
}

module.exports = new CalendarTransmitterService();