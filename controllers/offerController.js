const { Order, Offer, NotificationState } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize");
const limitService = require('../service/limit_service')

class OfferController {

    async create(req, res, next) {
        let { language,formData } = req.body

        let {
            userInfoId,
            carrierId,
            cost: { value: cost },
            time_from: { value: time_from },
            orderId,
            carrier_comment: { value: carrier_comment },
        } = formData
        try {

            await limitService.check_account_activated(language,carrierId)
            await limitService.check_subscription(language,carrierId, '', 'offer')

            let offer = await Offer.create({
                userInfoId,
                carrierId,
                cost,
                time_from,
                orderId,
                carrier_comment
            })

            await limitService.increase(  carrierId, '', 'offer')

            return res.json(offer)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { orderIDs, userInfoId } = req.body
            let offer =
            {
                count: undefined,
                rows: [],
                changes: {}
            }

            offer = await Offer.findAndCountAll({ where: { orderId: orderIDs } })

            //Getting state
            let notificationState = await NotificationState.findOne({ where: { userInfoId } })

            let offersState = JSON.parse(notificationState.order_state).map(el => el.id)
            let previousState = JSON.parse(notificationState.offer_state)
            let state = await Offer.findAll({ where: { orderId: { [Op.in]: offersState } } })

            //State mapping adding differences to the response
            let addedObj = {
                new: [],
                updated: [],
                deleted: [],
            }

            let previousOfferState

            addedObj.new = state.filter(el => !(previousState.map(el => el.id)).includes(el.id))

            let stateForCompare = state.filter(el => (previousState.map(el => el.id)).includes(el.id))
            stateForCompare.forEach(element => {
                previousOfferState = previousState.find(el => el.id === element.id)
                if (JSON.stringify(previousOfferState) !== JSON.stringify(element)) {
                    addedObj.updated.push(element)
                }
            });

            addedObj.deleted = previousState.filter(el => !(state.map(el => el.id)).includes(el.id))

            offer.changes = addedObj

            //Saving state
            state = JSON.stringify(state)
            await NotificationState.update({ offer_state: state }, { where: { userInfoId: userInfoId } })

            return res.json(offer)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            let { formData } = req.body

            let {
                cost: { value: cost },
                time_from: { value: time_from },
                carrier_comment: { value: carrier_comment },
                this_carrier_offer_id
            } = formData

            await Offer.update({
                cost,
                time_from,
                carrier_comment
            },
                {
                    where: { id: this_carrier_offer_id }
                }
            )

            return res.send('updated')
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res) {
        try {
            let { id } = req.query
            await Offer.destroy({ where: { id: id } })

            return res.send('deleted')
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new OfferController()