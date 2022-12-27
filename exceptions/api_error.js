const translateService = require('../service/translate_service')

class ApiError extends Error {
    status
    errors

    constructor(status, message, errors = []) {
        super(message);
        this.status = status
        this.errors = errors
    }

    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors)
    }

    static internal(message) {
        return new ApiError(500, message)
    }

    static forbidden(message) {
        return new ApiError(403, message)
    }

    static unauthorizedError() {
        return new ApiError(401, translateService.setNativeTranslate('english',
            {
                russian: ['Пользователь не авторизован'],
                english: ['User not authorized']
            }
        ))
    }
}

module.exports = ApiError