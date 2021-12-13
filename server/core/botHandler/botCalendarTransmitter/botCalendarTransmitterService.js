var BotCalendarTransmitter = require('./botCalendarTransmitter');
var CandidatesRepository = require('../../objects/candidates/candidatesRepository');

class BotCalendarTransmitterService {
    async sendSuggestions(suggestions, n_vacancy, n_candidate){
        var candidate = await CandidatesRepository.get({
            where: {
                id: n_candidate
            }
        });

        var data = {
            s_tg_id: candidate.s_tg_id,
            n_vacancy: n_vacancy,
            dates: suggestions
        };
        BotCalendarTransmitter.sendSuggestions(data);
    }
}

module.exports = new BotCalendarTransmitterService();