require('dotenv').config();

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

class BotCalendarTransmitter {
    client;

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
        
        this.client = new bot_reciever_proto.BotCalendarService(process.env.BOT_TRANSMITTER_ADDRESS + ':' + process.env.BOT_CALENDAR_TRANSMITTER_PORT, grpc.credentials.createInsecure());
    }

    async sendSuggestions(data){
        this.client.systemHasTime(
            data,
            (error, response) => {
                console.log(error);
            }
        );
    }
}

module.exports = new BotCalendarTransmitter();