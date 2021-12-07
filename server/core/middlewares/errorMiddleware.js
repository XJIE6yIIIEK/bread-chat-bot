var ErrorHandler = require('../errorHandlers/errorHandler');

module.exports = function(err, req, res, next) {
    if(err instanceof ErrorHandler){
        if(err.status == 401){
            res.header('Access-Control-Expose-Headers', 'Location');
            res.header('Location', req.header('Origin') + '/index.html');
        }

        return res.status(err.status).json({message: err.message});
    }

    return res.status(500).json({message: "Непредвиденная ошибка", error: err});
}