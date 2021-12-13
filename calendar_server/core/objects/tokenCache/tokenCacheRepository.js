var TokensCache = require('./tokenCacheModel');

class TokensCacheRepository {
    async create(data){
        var cache = await TokensCache.create(data);
        return cache;
    }

    async get(conditions = {}){
        var cache = await TokensCache.findOne(conditions);
        return cache;
    }

    async patch(cache){
        cache.save();
    }
}

module.exports = new TokensCacheRepository();