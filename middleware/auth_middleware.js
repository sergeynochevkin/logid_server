const jwt = require('jsonwebtoken')
const ApiError = require('../exceptions/api_error')
const tokenService = require('../service/token_service');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const authorisationHeader = req.headers.authorization
        if (!authorisationHeader) {
            return next(ApiError.unauthorizedError())
        }
        const accessToken = authorisationHeader.split(' ')[1]
        if (!accessToken) {
            return next(ApiError.unauthorizedError())
        }
        const userData = tokenService.validateAccessToken(accessToken)
        if (!userData) {
            return next(ApiError.unauthorizedError())
        }
        req.user = userData
        next()
    }
    catch (e) {
        return next(ApiError.unauthorizedError())
    }
}


