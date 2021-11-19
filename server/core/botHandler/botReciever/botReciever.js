require('dotenv').config();

var BotRecieverService = require('./botRecieverService');

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

class BotRecieverController {
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

        this.server.addService(bot_reciever_proto.BotService.service, {
            getCache: this.getCache,
            sendCandidateInfo: this.recieveCandidateInfo,
            getCandidateInfo: this.getCandidateInfo
        });
    }

    async getCache(call, callback){
        var cache = await BotRecieverService.getCache();

        callback(null, cache);
    }

    async getCandidateInfo(call, callback){
        var tgId = call.request.s_tg_id;
        var candidate = await BotRecieverService.getCandidate(tgId);

        callback(null, candidate);
    }

    async recieveCandidateInfo(call, callback){
        var candidateInfo = call.request.candidateMainInfo;
        var candidateResumes = call.request.candidateResumes;

        var candidate = await BotRecieverService.addCandidateInfo(candidateInfo);
        await BotRecieverService.addCandidateResume(candidate, candidateResumes);

        callback(null, {});
    }
}

module.exports = new BotRecieverController();