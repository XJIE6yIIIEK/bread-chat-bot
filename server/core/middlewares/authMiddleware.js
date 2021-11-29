const ErrorHandler = require('../errorHandlers/errorHandlers');
const AuthUtils = require('../auth/authUtils');

module.exports = (req, res, next) => {
    var token = req.cookies.access_token;
    var tokenData;

    if(!token || !(tokenData = AuthUtils.verifyToken(token))){
        return next(ErrorHandler.unauthorized('Войдите в систему!'));
    }

    req.user.id = tokenData.id

    next();
}