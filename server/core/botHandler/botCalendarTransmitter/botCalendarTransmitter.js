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

    async sendSuggestions(data, callbacks){
        this.client.systemHasTime(
            data,
            (error, response) => {
                console.log(error);
                if(error && error.code == 14){
                    callbacks.notResponding();
                    return;
                }

                callbacks.success();
            }
        );
    }

    async rejectedByUser(data){
        this.client.rejectedByUser({
                s_tg_id: data.s_tg_id,
                n_vacancy: data.n_vacancy
            },
            (error, response) => {

            }
        );
    }

    async connectionCheck(success, error){
        this.client.connectionCheck(
            {},
            (error, response) => {
                if(error && error.code == 14){
                    return error();
                }

                return success();
            }
        );
    }
}

module.exports = new BotCalendarTransmitter();