const ApiError = require('../exceptions/api_error')
const { UserAppSetting } = require('../models/models')

class SettingController {


    async getAll(req, res, next) {
        try {
            let userInfoId = req.query
            let settings = await UserAppSetting.findAll({ where: userInfoId })
            return res.json(settings)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        let settings
        try {
            let { id, value, userInfoId } = req.body
            await UserAppSetting.update({ value }, { where: { id } })
            try {
                settings = await UserAppSetting.findAll({ where: { userInfoId } })
                return res.json(settings)
            } catch (e) {
                next(ApiError.badRequest(e.message))
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new SettingController()