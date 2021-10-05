var MessagesService = require('./messagesService');

class MessagesController {
    async getAll(req, res, next){
        var data = {
            tgId: req.params.s_tg_id,
            options: req.query
        };
        var messages = await MessagesService.getAll(data, next);
        return res.status(200).json(messages);
    }
}

module.exports = new MessagesController();