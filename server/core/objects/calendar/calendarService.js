const CalendarRepository = require('./calendarRepository');

class CalendarService {
    async setMeetingAvailability(n_user, n_vacancy, n_candidate){
        var meeting = await CalendarRepository.get({
            where: {
                n_candidate: n_candidate,
                n_vacancy: n_vacancy
            }
        });

        if(!meeting){
            meeting = {
                n_user: n_user,
                n_vacancy: n_vacancy,
                n_candidate: n_candidate
            };

            await CalendarRepository.create(meeting);
        } else {
            meeting.n_status = 1;
            await CalendarRepository.patch(meeting);
        }
    }
}

module.exports = new CalendarService();