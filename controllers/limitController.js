const ApiError = require('../exceptions/api_error')
const { UserAppLimit } = require('../models/models')

class LimitController {


    async getOne(req, res, next) {
        try {
            let userInfoId = req.query
            let limits = await UserAppLimit.findOne({ where: userInfoId })
            return res.json(limits)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new LimitController()