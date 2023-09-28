const ApiError = require('../exceptions/api_error')
const { UserAppState } = require('../models/models')
const { role_service } = require('./order_controller/role_service')
const { supervisor_id_service } = require('./order_controller/supervisor_id_service')

class StateController {

    async create(req, res, next) {
        try {

        } catch (error) {

        }
    }

    async getOne(req, res, next) {
        try {
            let { userInfoId } = req.query
            let role = await role_service(userInfoId)
            let state
            if (role !== 'driver') {
                state = await UserAppState.findOne({ where: { userInfoId } })
            } else {
                state = await UserAppState.findOne({ where: { userInfoId }, raw:true })
                let supervisor_id = await supervisor_id_service(userInfoId)
                let supervisor_state = await UserAppState.findOne({ where: { userInfoId: supervisor_id } })
                supervisor_state = JSON.parse(supervisor_state.state)
                state = { ...state, supervisor_state: { cities: supervisor_state.user_map_cities } }
            }
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