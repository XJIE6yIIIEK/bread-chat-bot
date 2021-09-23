var ErrorHandler = require('../errorHandlers/errorHandler');

module.exports = function(err, req, res, next) {
    if(err instanceof ErrorHandler){
        return res.status(err.status).json({message: err.message});
    }

    return res.status(500).json({message: "Непредвиденная ошибка", error: err});
}