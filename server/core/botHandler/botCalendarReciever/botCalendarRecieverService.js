const CalendarTransmitterService = require('../../calendarHandler/calendarTransmitterService');
var CandidatesService = require('../../objects/candidates/candidatesService');

class BotCalendarRecieverService {
    async candidateChooseTime(callData, rpcCallback, CandidatesService){
        CalendarTransmitterService.candidateChooseTime(
            callData,
            rpcCallback,
            async (data, meeting) => {
                CandidatesService.updateMeeting(data, meeting);
            }
        );
    }

    async rejectMeeting(){

    }

    async rejectAll(){

    }
}

module.exports = new BotCalendarRecieverService();