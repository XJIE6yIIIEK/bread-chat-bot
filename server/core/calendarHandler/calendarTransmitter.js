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

    async findMeetingTime(meetingPayload, callbackToService){
        this.client.findMeetingTime(
            meetingPayload,
            (error, response) => {
                if(!response){
                    return;
                }

                callbackToService(response);
            }
        );
    }

    async trySetMeetingTime(data, candidateServiceCallback, rpcCallback){
        this.client.trySetMeetingTime({
                candidateName: data.candidateName,
                n_user: data.n_user,
                beginISO: data.date.beginISO,
                endISO: data.date.endISO
            },
            (error, response) => {
                if(response && response.err){
                    rpcCallback(response);
                    return;
                }
                
                rpcCallback();
                candidateServiceCallback();
            }
        );
    }
}

module.exports = new CalendarTransmitter();