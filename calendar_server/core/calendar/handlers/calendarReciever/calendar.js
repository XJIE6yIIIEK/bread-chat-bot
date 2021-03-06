require('dotenv').config();

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var CalendarService = require('./calendarService');

class CalendarReciever {
    server;

    initialize(){
        const PROTO_PATH = __dirname + process.env.CALENDAR_PROTO_PATH;
        var packageDefinition = protoLoader.loadSync( 
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            }
        );
        var calendar_reciever_proto = grpc.loadPackageDefinition(packageDefinition).calendar;
        this.server = new grpc.Server();

        this.server.addService(calendar_reciever_proto.CalendarService.service, {
            findMeetingTime: this.findMeetingTime,
            trySetMeetingTime: this.trySetMeetingTime,
            deleteMeeting: this.deleteMeeting
        });

        this.server.bindAsync(process.env.CALENDAR_ADDRESS + ':' + process.env.CALENDAR_PORT, grpc.ServerCredentials.createInsecure(), () => {
            this.server.start();
        });
    }

    async findMeetingTime(call, callback){
        var meetingData = {
            startDate: call.request.startDate,
            endDate: call.request.endDate,
            duration: call.request.duration
        };

        var result = await CalendarService.findMeetingTime(call.request.userId, meetingData);
        callback(null, result);
    }

    async trySetMeetingTime(call, callback){
        var meetingData = {
            candidateName: call.request.candidateName,
            n_user: call.request.n_user,
            beginISO: call.request.beginISO,
            endISO: call.request.endISO
        }

        var result = await CalendarService.trySetMeetingTime(meetingData);
        if(result){
            callback(null, {
                err: result.err
            });
        } else {
            callback(null, {});
        }
    }

    async deleteMeeting(call, callback){
        var meetingData = {
            n_user: call.request.n_user,
            d_date: call.request.d_date
        };

        CalendarService.deleteMeetingEvent(
            meetingData,
            () => {
                callback(null, {});
            }
        );
    }
}

module.exports = new CalendarReciever();