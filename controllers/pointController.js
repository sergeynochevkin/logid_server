const { Point, NotificationState, Order } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize");
const point_service = require('../service/point_service');

class PointController {

    async create(req, res, next) {
        try {
            let { formData, userInfoId, newOrderIntegrationId, option } = req.body
            let points = await point_service.createPoints(formData, userInfoId, newOrderIntegrationId, option)
            return res.json(points)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { pointsIntegrationIds, userInfoId } = req.body

            let points =
            {
                count: undefined,
                rows: [],
                added: {}
            }

            points = await Point.findAndCountAll({ where: { orderIntegrationId: pointsIntegrationIds } });

            //Getting state
            let notificationState = await NotificationState.findOne({ where: { userInfoId } })

            let ordersState = JSON.parse(notificationState.order_state).map(el => el.pointsIntegrationId)
            let previousState = JSON.parse(notificationState.point_state)
            let state = await Point.findAll({ where: { orderIntegrationId: { [Op.in]: ordersState } } })

            //State mapping adding differences to the response
            let addedObj = {
                new: [],
                postponed: [],
                completed: [],
                canceled: [],
                in_work: []
            }

            let prev_new = previousState.filter(el => el.status === 'new')
            let prev_postponed = previousState.filter(el => el.status === 'postponed')
            let prev_completed = previousState.filter(el => el.status === 'completed')
            let prev_canceled = previousState.filter(el => el.status === 'canceled')
            let prev_in_work = previousState.filter(el => el.status === 'inWork')

            let actual_new = state.filter(el => el.status === 'new')
            let actual_postponed = state.filter(el => el.status === 'postponed')
            let actual_completed = state.filter(el => el.status === 'completed')
            let actual_canceled = state.filter(el => el.status === 'canceled')
            let actual_in_work = state.filter(el => el.status === 'inWork')

            addedObj.new = actual_new.filter(el => !(prev_new.map(el => el.id)).includes(el.id))
            addedObj.postponed = actual_postponed.filter(el => !(prev_postponed.map(el => el.id)).includes(el.id))
            addedObj.canceled = actual_canceled.filter(el => !(prev_canceled.map(el => el.id)).includes(el.id))
            addedObj.completed = actual_completed.filter(el => !(prev_completed.map(el => el.id)).includes(el.id))
            addedObj.in_work = actual_in_work.filter(el => !(prev_in_work.map(el => el.id)).includes(el.id))

            points.added = addedObj

            //State saving
            state = JSON.stringify(state)
            await NotificationState.update({ point_state: state }, { where: { userInfoId: userInfoId } })


            return res.json(points)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            let {
                id,
                status,
                carrier_comment,
                updated_by,
                updated_time,
                finished_time,
                role
            } = req.body
            await Point.update({
                status,
                carrier_comment,
                updated_by,
                updated_time,
                finished_time,
                updated_by_role: role
            }, {
                where: { id: id }
            })

            return res.send('updated')
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new PointController()