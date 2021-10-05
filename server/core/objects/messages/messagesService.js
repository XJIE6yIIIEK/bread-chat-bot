const MessagesRepository = require('./messagesRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class MessagesService {
    async getAll(data, next){
        const messages = await MessagesRepository.getAll({
            where: {
                s_tg_id: data.tgId
            }
        });
        
        return messages;
    }
}

module.exports = new MessagesService();