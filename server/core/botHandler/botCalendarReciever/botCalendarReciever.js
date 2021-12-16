require('dotenv').config();

var BotCalendarRecieverService = require('./botCalendarRecieverService');

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

class BotCalendarReciever {
    server;

    initialize(){
        const PROTO_PATH = __dirname + process.env.BOT_PROTO_PATH;
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
        var bot_reciever_proto = grpc.loadPackageDefinition(packageDefinition).telegramBot;
        this.server = new grpc.Server();

        this.server.addService(bot_reciever_proto.BotCalendarService.service, {
            candidateChooseTime: this.candidateChooseTime,
            rejectMeeting: this.rejectMeeting,
            rejectAll: this.rejectAll
        });

        this.server.bindAsync(process.env.BOT_RECIEVER_ADDRESS + ':' + process.env.BOT_CALENDAR_RECIEVER_PORT, grpc.ServerCredentials.createInsecure(), () => {
            console.log('Bot calendar reciever binded!');
            this.server.start();
        });
    }

    async candidateChooseTime(call, callback){
        BotCalendarRecieverService.candidateChooseTime(
            call.request,
            (data) => {
                if(data && data.err){
                    callback(null, {
                        err: data.err
                    });
                } else {
                    callback(null, {});
                }
            }
        );
    }

    async rejectMeeting(call, callback){
        BotCalendarRecieverService.rejectMeeting({
                s_tg_id: call.request.s_tg_id,
                n_vacancy: call.request.n_vacancy
            },
            async () => {
                callback(null, {});
            }
        );
    }

    async rejectAll(call, callback){
        BotCalendarRecieverService.rejectAll({
                s_tg_id: call.request.s_tg_id
            },
            async () => {
                callback(null, {});
            }
        );
    }
}

module.exports = new BotCalendarReciever();