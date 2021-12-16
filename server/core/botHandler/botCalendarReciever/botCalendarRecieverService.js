const CalendarTransmitterService = require('../../calendarHandler/calendarTransmitterService');
const CandidatesRepository = require('../../objects/candidates/candidatesRepository');
const CalendarRepository = require('../../objects/calendar/calendarRepository');
const CalendarService = require('../../objects/calendar/calendarService');

class BotCalendarRecieverService {
    async candidateChooseTime(callData, rpcCallback){
        CalendarTransmitterService.candidateChooseTime(
            callData,
            rpcCallback,
            async (data, meeting) => {
                CalendarService.updateMeeting(data, meeting);
            }
        );
    }

    async rejectMeeting(data, callback){
        var candidate = await CandidatesRepository.get({
            where: {
                s_tg_id: data.s_tg_id
            }
        });

        var meeting = await CalendarRepository.get({
            where: {
                n_candidate: candidate.id,
                n_vacancy: data.n_vacancy
            }
        });

        CalendarService.rejectMeeting({
                n_vacancy: data.n_vacancy,
                n_candidate: candidate.id,
                n_user: meeting.n_user,
                date: meeting.d_date
            },
            callback
        );
    }

    async rejectAll(data, callback){
        var candidate = await CandidatesRepository.get({
            where: {
                s_tg_id: data.s_tg_id
            }
        });

        var meetings = await CalendarRepository.getAll({
            where: {
                n_candidate: candidate.id
            }
        });

        for(var i = 0; i < meetings.length; i++){
            this.rejectMeeting({
                    n_vacancy: meetings[i].n_vacancy,
                    n_candidate: candidate.id,
                    n_user: meetings[i].n_user
                },
                () => {}
            );
        }

        callback();
    }
}

module.exports = new BotCalendarRecieverService();