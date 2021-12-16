const ErrorHandler = require('../errorHandlers/errorHandler');
const UsersRepository = require('../objects/users/usersRepository');
const AuthUtils = require('../auth/authUtils');

module.exports = (req, res, next) => {
    var accessToken = req.cookies.access_token;
    var refreshToken = req.cookies.refresh_token;

    var tokenErr = async (data = null) => {
        return next(ErrorHandler.unauthorized('Войдите в систему!'));
    }

    if(!accessToken){
        return tokenErr();
    }

    AuthUtils.verifyToken(
        accessToken,
        's_access_token',
        null,
        {
            allClear: async (accessTokenData) => {
                req.user = {
                    id: accessTokenData.id
                };

                next();
            },
            timeExpired: async (accessTokenData) => {
                if(!refreshToken){
                    return tokenErr();
                }

                AuthUtils.verifyToken(
                    refreshToken,
                    's_refresh_token',
                    accessTokenData.id,
                    {
                        allClear: async (data) => {
                            var newAccessToken = AuthUtils.generateToken({
                                    id: accessTokenData.id
                                },
                                'access',
                                accessTokenData.id
                            );
                            var newRefreshToken = AuthUtils.generateToken(
                                {},
                                'refresh',
                                accessTokenData.id
                            );
                    
                            res.cookie(
                                'access_token',
                                newAccessToken, {
                                    httpOnly: true
                                }
                            );
                    
                            res.cookie(
                                'refresh_token',
                                newRefreshToken, {
                                    httpOnly: true
                                }
                            );
            
                            req.user.id = accessTokenData.id
            
                            next();
                        },
                        timeExpired: tokenErr,
                        tokenError: tokenErr
                    }
                );
            },
            tokenError: tokenErr
        }
    );
}