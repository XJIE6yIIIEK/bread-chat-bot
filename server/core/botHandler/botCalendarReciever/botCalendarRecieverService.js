const CalendarTransmitterService = require('../../calendarHandler/calendarTransmitterService');

class BotCalendarRecieverService {
    async candidateChooseTime(data, rpcCallback){
        CalendarTransmitterService.candidateChooseTime(
            data,
            rpcCallback
        );
    }
}

module.exports = new BotCalendarRecieverService();