const TokensCacheRepository = require('../objects/tokenCache/tokenCacheRepository');

module.exports = async () => {
    var cache = await TokensCacheRepository.get();
    
    if(!cache){
        await TokensCacheRepository.create({
            s_cache: ''
        });
    }
}