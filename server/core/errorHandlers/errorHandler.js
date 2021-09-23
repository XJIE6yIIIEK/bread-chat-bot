class ErrorHandler extends Error {
    status;
    message;

    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }

    static badRequest(message, errors = []) {
        return new ErrorHandler(402, message, errors);
    }

    static internal(message, errors = []) {
        return new ErrorHandler(500, message, errors);
    }

    static forbidden(message, errors = []) {
        return new ErrorHandler(403, message, errors);
    }

    static unauthorized(message, errors = []) {
        return new ErrorHandler(401, message, errors);
    }
}

module.exports = ErrorHandler;