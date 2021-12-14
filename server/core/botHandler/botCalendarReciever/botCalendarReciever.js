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
            candidateChooseTime: this.candidateChooseTime
        });

        this.server.bindAsync(process.env.BOT_RECIEVER_ADDRESS + ':' + process.env.BOT_CALENDAR_RECIEVER_PORT, grpc.ServerCredentials.createInsecure(), () => {
            console.log('Bot calendar reciever binded!');
            this.server.start();
        });
    }

    async candidateChooseTime(call, callback){
        var a = 1;
        console.log('ы');
        BotCalendarRecieverService.candidateChooseTime(
            call.request,
            (data) => {
                if(data.err){
                    callback(data.err, {});
                } else {
                    callback(null, {});
                }
            }
        );
    }
}

module.exports = new BotCalendarReciever();