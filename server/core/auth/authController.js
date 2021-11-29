const AuthService = require('./authService');
const ErrorHandler = require('../errorHandlers/errorHandler');

class AuthController {
    async authenticate(req, res, next){
        var token = await AuthService.authenticate(req.body);
        if(token instanceof ErrorHandler){
            return next(token);
        }
        
        return res
                .cookie(
                    "access-token",
                    token, {
                        httpOnly: true
                    }
                )
                .status(203);
    }
}

module.exports = new AuthController();