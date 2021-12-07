const AuthService = require('./authService');
const ErrorHandler = require('../errorHandlers/errorHandler');

class AuthController {
    async authenticate(req, res, next){
        var tokens = await AuthService.authenticate(req.body);
        if(tokens instanceof ErrorHandler){
            return next(tokens);
        }
        
        res.cookie(
            'access_token',
            tokens.accessToken, {
                httpOnly: true
            }
        );

        res.cookie(
            'refresh_token',
            tokens.refreshToken, {
                httpOnly: true
            }
        );

        return res.status(203);
    }
}

module.exports = new AuthController();