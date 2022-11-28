const ApiError = require('../exceptions/api_error')
const { UserAppState } = require('../models/models')

class StateController {

    async create(req, res, next) {
        try {

        } catch (error) {

        }
    }

    async getOne(req, res, next) {
        try {
            let { userInfoId } = req.query
            let state = await UserAppState.findOne({ where: { userInfoId } })
            return res.json(state)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            let { state, userInfoId } = req.body
            await UserAppState.update({ state }, { where: { userInfoId } })
            return res.send('user app state updated')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        try {

        } catch (error) {

        }
    }
}

module.exports = new StateController()