var Calendar = require('./calendarModel');

class CalendarRepository {
    async create(data){
        var calendar = await Calendar.create(data);
        return calendar;
    }

    async get(conditions = {}){
        var calendar = await Calendar.findOne(conditions);
        return calendar;
    }

    async getAll(conditions = {}){
        var calendars = await Calendar.findAll(conditions);
        return calendars;
    }

    async patch(calendar){
        calendar.save();
    }

    async delete(calendar){
        calendar.destroy();
    }
}

module.exports = new CalendarRepository();