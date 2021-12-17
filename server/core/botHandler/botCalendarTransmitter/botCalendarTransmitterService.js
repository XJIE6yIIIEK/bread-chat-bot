const BotCalendarTransmitter = require('./botCalendarTransmitter');
const CandidatesRepository = require('../../objects/candidates/candidatesRepository');

class BotCalendarTransmitterService {
    async sendSuggestions(suggestions, n_vacancy, n_candidate, callbacks){
        var candidate = await CandidatesRepository.get({
            where: {
                id: n_candidate
            }
        });

        delete suggestions.err;

        var data = {
            s_tg_id: candidate.s_tg_id,
            n_vacancy: n_vacancy,
            dates: suggestions.dates
        };
        BotCalendarTransmitter.sendSuggestions(data, callbacks);
    }

    async rejectedByUser(data){
        var user = await CandidatesRepository.get({
            where: {
                id: data.n_candidate
            }
        });

        data.s_tg_id = user.s_tg_id;

        BotCalendarTransmitter.rejectedByUser(
            data
        );
    }
}

module.exports = new BotCalendarTransmitterService();