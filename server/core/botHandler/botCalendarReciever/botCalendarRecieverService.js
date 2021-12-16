const CalendarTransmitterService = require('../../calendarHandler/calendarTransmitterService');
const CandidatesRepository = require('../../objects/candidates/candidatesRepository');
const CalendarRepository = require('../../objects/calendar/calendarRepository');
const CalendarService = require('../../objects/calendar/calendarService');
const DBRepository = require('../../db/dbRepository');

class BotCalendarRecieverService {
    async candidateChooseTime(callData, rpcCallback){
        var candidate = await CandidatesRepository.get({
            where: {
                s_tg_id: callData.s_tg_id
            }
        });
        
        callData.n_candidate = candidate.id;
        callData.candidateName = candidate.s_name;

        if(!callData.date){
            CalendarService.unwantedTimes(callData.n_candidate, callData.n_vacancy);
            rpcCallback({
                err: 'unwanted'
            });
            return;
        }

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

        var meeting = await DBRepository.rawQuery(
            'SELECT n_user, d_date at time zone \'Europe/Moscow\' AS d_date FROM t_meetings ' +
            `WHERE n_candidate = ${candidate.id} AND n_vacancy = ${data.n_vacancy}`,
            'SELECT'
        );

        CalendarService.rejectMeeting({
                n_vacancy: data.n_vacancy,
                n_candidate: candidate.id,
                n_user: meeting[0].n_user,
                d_date: meeting[0].d_date
            },
            meeting,
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