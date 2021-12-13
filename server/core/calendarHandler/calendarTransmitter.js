require('dotenv').config();

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

class CalendarTransmitter {
    client;

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
        
        var calendar_proto = grpc.loadPackageDefinition(packageDefinition).calendar;
        
        this.client = new calendar_proto.CalendarService(process.env.CALENDAR_ADDRESS + ':' + process.env.CALENDAR_PORT, grpc.credentials.createInsecure());
    }

    async findMeetingTime(meetingPayload, callback){
        this.client.findMeetingTime(
            meetingPayload,
            (error, response) => {
                if(response.err){
                    console.log(err);
                    return;
                }

                callback(response);
            }
        );
    }
}

module.exports = new CalendarTransmitter();