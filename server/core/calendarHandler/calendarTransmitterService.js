const CalendarTransmitter = require('./calendarTransmitter');
const CandidateService = require('../objects/candidates/candidatesService');
const CalendarRepository = require('../objects/calendar/calendarRepository');
const CandidateRepository = require('../objects/candidates/candidatesRepository');

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

    async candidateChooseTime(data, rpcCallback){
        var candidate = await CandidateRepository.get({
            where: {
                s_tg_id: data.s_tg_id
            }
        });
        
        data.n_candidate = candidate.id;

        var meeting = await CalendarRepository.get({
            where: {
                n_candidate: candidate.id,
                n_vacancy: data.n_vacancy
            }
        });

        data.n_user = meeting.n_user;

        CalendarTransmitter.trySetMeetingTime(
            data,
            () => {
                CandidateService.setMeetingTime(data, meeting);
            },
            rpcCallback
        );
    }
}

module.exports = new CalendarTransmitterService();