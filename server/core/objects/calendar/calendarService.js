const CalendarRepository = require('./calendarRepository');
const CalendarTransmitterService = require('../../calendarHandler/calendarTransmitterService');
const BotCalendarTransmitterService = require('../../botHandler/botCalendarTransmitter/botCalendarTransmitterService');
var ErrorHandler = require('../../errorHandlers/errorHandler');

var {format} = require('date-fns');

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

    async meetingAvailability(suggestionsData, n_user, n_candidate, n_vacancy, responseCallback){
        if(suggestionsData.err){
            switch(suggestionsData.err){
                case 'noAvailTime': {
                    responseCallback(ErrorHandler.badRequest(
                        'Нет свободного времени для собеседования. Задайте другой интервал для поиска или сократите время собеседования'
                    ));
                } break;

                case 'notSignedIn': {
                    responseCallback(ErrorHandler.badRequest(
                        'Авторизуйтесь в сервисах Microsoft в личном кабинете'
                    ));
                } break;
            }
            return;
        }

        
        this.setMeetingAvailability(n_user, n_vacancy, n_candidate);

        BotCalendarTransmitterService.sendSuggestions(suggestionsData, n_vacancy, n_candidate);
        
        responseCallback({message: 'Время для собеседования найдено. Кандидату отправлены все возможные варианты собеседования.'});
        return;
    }

    async setMeeting(userId, candidateId, vacancyId, meetingData, responseCallback){        
        var meeting = await CalendarRepository.get({
            where: {
                n_vacancy: vacancyId,
                n_candidate: candidateId
            }
        });

        meetingData.startDate = new Date(meetingData.startDate);
        meetingData.startDate.setHours(0);
        meetingData.startDate.setMinutes(0);
        meetingData.startDate.setSeconds(0);
        meetingData.startDate = format(meetingData.startDate, "yyyy-MM-dd'T'HH:mm:ss");

        meetingData.endDate = new Date(meetingData.endDate);
        meetingData.endDate.setHours(23);
        meetingData.endDate.setMinutes(59);
        meetingData.endDate.setSeconds(59);
        meetingData.endDate = format(meetingData.endDate, "yyyy-MM-dd'T'HH:mm:ss");

        if(!meeting){
            await CalendarTransmitterService.createNewMeeting(
                userId,
                meetingData,
                async (suggestionsData) => {
                    this.meetingAvailability(suggestionsData, userId, candidateId, vacancyId, responseCallback);
                }
            );
            return;
        }

        switch(meeting.n_status){
            case 1: {
                responseCallback(ErrorHandler.badRequest('Кандидат ещё рассматривает предложение на собеседование.'));
            } break;

            case 2: {
                responseCallback(ErrorHandler.badRequest('Кандидату уже назначено собеседование.'));
            } break;

            case 3:
            case 4: {
                if(!meeting.n_user == userId){
                    responseCallback(ErrorHandler.badRequest('Невозможно управлять кандидатами других HR.'));
                    break;
                }

                await CalendarTransmitterService.createNewMeeting(
                    userId,
                    meetingData,
                    async (suggestionsData) => {
                        this.meetingAvailability(suggestionsData, userId, candidateId, vacancyId, responseCallback);
                    }
                );
            } break;
        }
    }

    async updateMeeting(data, meeting){
        meeting.n_status = 2;
        meeting.d_date = format(new Date(data.date.beginISO), "yyyy-MM-dd'T'HH:mm:ss+0300");

        CalendarRepository.patch(meeting);
    }

    async rejectMeeting(data, callback){
        if(!data.d_date){
            var meeting = await CalendarRepository.get({
                where: {
                    n_user: data.n_user
                }
            });

            data.d_date = format(new Date(meeting.d_date), "yyyy-MM-dd'T'HH:mm:ss");
        }

        CalendarTransmitterService.rejectMeeting(data, callback);
    }
}

module.exports = new CalendarService();