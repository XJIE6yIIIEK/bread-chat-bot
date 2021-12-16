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

    AuthUtils.verifyAccessToken(
        accessToken,
        {
            allClear: async (accessTokenData) => {
                req.user = {
                    id: accessTokenData.id
                };

                next();
            },
            timeExpired: async () => {
                if(!refreshToken){
                    return tokenErr();
                }                

                AuthUtils.verifyRefreshToken(
                    refreshToken,
                    {
                        allClear: async (data) => {
                            var newAccessToken = AuthUtils.generateToken({
                                    id: accessTokenData.id
                                },
                                'access',
                                data.id
                            );
                            var newRefreshToken = AuthUtils.generateToken(
                                {},
                                'refresh',
                                data.id
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
            
                            req.user.id = dData.id
            
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