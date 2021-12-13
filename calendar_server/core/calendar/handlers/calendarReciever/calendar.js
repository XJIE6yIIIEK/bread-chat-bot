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
            findMeetingTime: this.findMeetingTime
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
        callback(result);
    }
}

module.exports = new CalendarReciever();