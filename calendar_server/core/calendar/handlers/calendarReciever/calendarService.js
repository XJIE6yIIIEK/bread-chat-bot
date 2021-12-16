const UsersRepository = require('../../../objects/users/usersRepository');
var MSAL = require('../../../auth/auth');
var graph = require('../../../graph/graph');

const {format} = require('date-fns');
const {zonedTimeToUtc} = require('date-fns-tz');
const addDays = require('date-fns/addDays');

class CalendarService {
    async getMSALAndId(userId){
        var user = await UsersRepository.get({
            where: {
                n_user: userId
            }
        });

        var graphId = user.s_graph_id;
        var msalClient = MSAL.client;

        return {
            graphId,
            msalClient
        };
    }

    async findMeetingTime(userId, meetingData){
        var msalDetails = await this.getMSALAndId(userId);

        var credentials = await graph.getClientAndUser(msalDetails.msalClient, msalDetails.graphId);

        var freeTimes = await graph.getFreeTime(credentials, meetingData.startDate, meetingData.endDate, meetingData.duration);
        
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
            var date = format(rawDate, 'dd.MM.yyyy');
            if(lastDate == undefined || date != lastDate){
                suggestions[suggestions.length] = {
                    date: date,
                    times: [{
                        beginISO: times[i].meetingTimeSlot.start.dateTime,
                        endISO: times[i].meetingTimeSlot.end.dateTime,
                        beginEnd: format(new Date(times[i].meetingTimeSlot.start.dateTime), 'HH:mm') + ' - ' + format(new Date(times[i].meetingTimeSlot.end.dateTime), 'HH:mm') + ' МСК'
                    }]
                };

                lastDate = date;
            } else {
                var timesLength = suggestions[suggestions.length - 1].times.length;
                suggestions[suggestions.length - 1].times[timesLength] = {
                    beginISO: times[i].meetingTimeSlot.start.dateTime,
                    endISO: times[i].meetingTimeSlot.end.dateTime,
                    beginEnd: format(new Date(times[i].meetingTimeSlot.start.dateTime), 'HH:mm') + ' - ' + format(new Date(times[i].meetingTimeSlot.end.dateTime), 'HH:mm') + ' МСК'
                };
            }
        }

        return {
            dates: suggestions
        };
    }

    async trySetMeetingTime(data){
        var msalDetails = await this.getMSALAndId(data.n_user);

        var credentials = await graph.getClientAndUser(msalDetails.msalClient, msalDetails.graphId);

        var bitmask = await graph.checkAviability(credentials.client, credentials.user, data.beginISO, data.endISO);
        var zeroMask = bitmask.replaceAll(/[^0]/g, '0');
        if(bitmask != zeroMask){
            return {err: 'unavailable'};
        } else {
            var result = await graph.setMeetingTime(credentials.client, data.beginISO, data.endISO, data.candidateName);
        }
    }

    async deleteMeetingEvent(data, callback){
        var msalDetails = await this.getMSALAndId(data.n_user);

        var credentials = await graph.getClientAndUser(msalDetails.msalClient, msalDetails.graphId);

        graph.deleteMeeting(credentials.client, data.d_date);
        callback();
    }
}

module.exports = new CalendarService();