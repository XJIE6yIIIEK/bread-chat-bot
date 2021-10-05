var Messages = require('./messagesModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class MessagesRepository {
    async getAll(conditions = {}){
        var messages = await Messages.findAll(conditions);
        return messages;
    }
}

module.exports = new MessagesRepository();