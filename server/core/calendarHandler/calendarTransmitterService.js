const CalendarTransmitter = require('./calendarTransmitter');
const CalendarRepository = require('../objects/calendar/calendarRepository');
const CandidateRepository = require('../objects/candidates/candidatesRepository');

class CalendarTransmitterService {
    async createNewMeeting(userId, meetingData, callback, connectionTimeout){
        var meetingPayload = {
            startDate: meetingData.startDate,
            endDate: meetingData.endDate,
            duration: meetingData.duration,
            userId: userId
        }

        await CalendarTransmitter.findMeetingTime(meetingPayload, callback, connectionTimeout);
    }

    async candidateChooseTime(data, rpcCallback, updateDelegate){
        var meeting = await CalendarRepository.get({
            where: {
                n_candidate: data.n_candidate,
                n_vacancy: data.n_vacancy
            }
        });

        data.n_user = meeting.n_user;

        CalendarTransmitter.trySetMeetingTime(
            data,
            async () => {
                updateDelegate(data, meeting);
            },
            rpcCallback
        );
    }

    async rejectMeeting(data, callback){
        CalendarTransmitter.rejectMeeting({
                n_user: data.n_user,
                d_date: data.d_date
            },
            callback
        );
    }

    async connectionCheck(success, error){
        CalendarTransmitter.connectionCheck(success, error);
    }
}

module.exports = new CalendarTransmitterService();