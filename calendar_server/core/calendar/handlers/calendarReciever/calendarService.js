const UsersRepository = require('../../../objects/users/usersRepository');
const {format} = require('date-fns');
var MSAL = require('../../../auth/auth');
var graph = require('../../../graph/graph');

class CalendarService {
    async findMeetingTime(userId, meetingData){
        var user = await UsersRepository.get({
            where: {
                n_user: userId
            }
        });

        var graphId = user.s_graph_id;
        var msalClient = MSAL.client;

        var freeTimes = await graph.getFreeTime(msalClient, graphId, meetingData.startDate, meetingData.endDate, meetingData.duration);
        
        if(freeTimes.meetingTimeSuggestions.length == 0){
            return {
                err: 'noAvailTime'
            };
        }

        var times = freeTimes.meetingTimeSuggestions;
        
        var suggestions = [];
        var lastDate = undefined;
        
        for(var i = 0; i < times.length; i++){
            var rawDate = new Date(times[i].meetingTimeSlot.start.dateTime);
            var date = format(rawDate, 'DD.MM.YYYY');
            if(lastDate == undefined || date != lastDate){
                suggestions[suggestions.length] = {
                    dateTime: date,
                    times: [{
                        beginISO: times[i].meetingTimeSlot.start.dateTime,
                        endISO: times[i].meetingTimeSlot.end.dateTime,
                        beginEnd: format(times[i].meetingTimeSlot.start.dateTime, 'HH:mm') + ' - ' + format(times[i].meetingTimeSlot.end.dateTime, 'HH:mm') + ' МСК'
                    }]
                };

                lastDate = date;
            } else {
                var timesLength = suggestions[suggestions.length - 1].times.length;
                suggestions[suggestions.length - 1].times[timesLength] = {
                    beginISO: times[i].meetingTimeSlot.start.dateTime,
                    endISO: times[i].meetingTimeSlot.end.dateTime,
                    beginEnd: format(times[i].meetingTimeSlot.start.dateTime, 'HH:mm') + ' - ' + format(times[i].meetingTimeSlot.end.dateTime, 'HH:mm') + ' МСК'
                };
            }
        }

        return suggestions;
    }
}

module.exports = new CalendarService();