require('dotenv').config();

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

class BotTransmitterController {
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
        
        this.client = new bot_reciever_proto.BotService(process.env.BOT_TRANSMITTER_ADDRESS + ':' + process.env.BOT_TRANSMITTER_PORT, grpc.credentials.createInsecure());
    }

    async infoUpdated(info){
        this.client.infoUpdated({
                info: info
            },
            (error, response) => {}
        );
    }

    async formUpdated(form){
        this.client.formUpdated({
                form: form
            },
            (error, response) => {}
        );
    }

    async vacancyUpdated(vacancy){
        this.client.vacancyUpdated({
                vacancy: vacancy
            },
            (error, response) => {}
        );
    }

    async formToVacUpdated(data){
        this.client.formToVacUpdated({
                data
            },
            (error, response) => {}
        );
    }
}

module.exports = new BotTransmitterController();