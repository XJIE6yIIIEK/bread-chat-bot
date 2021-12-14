const AuthService = require('./authService');
const ErrorHandler = require('../errorHandlers/errorHandler');

class AuthController {
    async authenticate(req, res, next){
        var payload = await AuthService.authenticate(req.query);
        if(payload instanceof ErrorHandler){
            return next(payload);
        }
        
        res.cookie(
            'access_token',
            payload.accessToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true
            }
        );

        res.cookie(
            'refresh_token',
            payload.refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true
            }
        );

        res.cookie(
            'hr_id',
            payload.userId, {
                httpOnly: true,
                sameSite: 'Node',
                secure: true
            }
        );

        return res.status(200).end();
    }

    async check(req, res, next){
        return res.status(200).end();
    }
}

module.exports = new AuthController();