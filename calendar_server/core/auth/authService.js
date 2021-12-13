require('dotenv').config();
var MSAL = require('./auth');
const UsersRepository = require('../objects/users/usersRepository');
const graph = require('../graph/graph');

class AuthService{
    async createRedirectUrl(userId){
        const urlParams = {
            scopes: process.env.OAUTH_SCOPES.split(','),
            state: userId,
            redirectUri: process.env.OAUTH_REDIRECT_URI + '/auth/callback'
        };

        const authUrl = await MSAL.client.getAuthCodeUrl(urlParams);
        return authUrl;
    }

    async handleMicrosoftRepsponse(req){
        const tokenRequest = {
            code: req.query.code,
            scopes: process.env.OAUTH_SCOPES.split(','),
            redirectUri: process.env.OAUTH_REDIRECT_URI + '/auth/callback'
        };

        console.log(req.query.state);

        const response = await MSAL.client.acquireTokenByCode(tokenRequest);
        const microUserId = response.account.homeAccountId;
        const userId = req.query.state;

        var user = await UsersRepository.get({
            where: {
                n_user: userId
            }
        });

        if(!user){
            var _user = await UsersRepository.create({
                n_user: userId,
                s_graph_id: microUserId
            });
        } else {
            user.s_graph_id = microUserId;
            await UsersRepository.patch(user);
        }
    }
}

module.exports = new AuthService();