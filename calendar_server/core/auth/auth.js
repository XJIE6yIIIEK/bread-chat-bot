const msal = require('@azure/msal-node');
const TokensCacheRepository = require('../objects/tokenCache/tokenCacheRepository');

const beforeCacheAccess = async (cacheContext) => {
    var cache = await TokensCacheRepository.get();
    cacheContext.tokenCache.deserialize(cache.s_cache);
};

const afterCacheAccess = async (cacheContext) => {
    if(cacheContext.cacheHasChanged){
        var cache = await TokensCacheRepository.get();
        cache.s_cache = cacheContext.tokenCache.serialize();
        await TokensCacheRepository.patch(cache);
    }
};

const cachePlugin = {
    beforeCacheAccess,
    afterCacheAccess
};

class MSAL {
    client;

    async initialize(){
        const msalConfig = {
            auth: {
                clientId: process.env.OAUTH_CLIENT_ID,
                authority: process.env.OAUTH_AUTHORITY,
                clientSecret: process.env.OAUTH_CLIENT_SECRET
            },
            cahce: {
                cachePlugin
            },
            system: {
                loggerOptions: {
                    loggerCallback(loglevel, message, containsPii) {
                        console.log(message);
                    },
                    piiLoggingEnabled: false,
                    logLevel: msal.LogLevel.Verbose
                }
            }
        };

        this.client = new msal.ConfidentialClientApplication(msalConfig);
        this.client.getTokenCache();
    }
}

module.exports = new MSAL();