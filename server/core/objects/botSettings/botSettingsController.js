const BotSettingsService = require('./botSettingsService');

class BotSettingsController {
    async get(req, res, next){
        var settings = await BotSettingsService.get();
        return res.status(200).json(settings).end();
    }
}

module.exports = new BotSettingsController();