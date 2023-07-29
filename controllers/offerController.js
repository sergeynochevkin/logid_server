const { Order, Offer, NotificationState, Transport, UserInfo, ServerNotification } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize");
const limitService = require('../service/limit_service');
const language_service = require('../service/language_service');
const mail_service = require('../service/mail_service');
const translate_service = require('../service/translate_service');
const { v4 } = require('uuid');
const { defaults } = require('pg');


class OfferController {

    async create(req, res, next) {
        let { language, formData } = req.body

        let {
            userInfoId,
            carrierId,
            cost: { value: cost },
            time_from: { value: time_from },
            orderId,
            carrier_comment: { value: carrier_comment },
            transportid
        } = formData
        try {

            await limitService.check_account_activated(language, carrierId)
            await limitService.check_subscription(language, carrierId, '', 'offer')

            let offer = await Offer.create({
                userInfoId,
                carrierId,
                cost,
                time_from,
                orderId,
                carrier_comment,
                transportid
            })

            await limitService.increase(carrierId, '', 'offer')

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
                changes: {},
                transport: []
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

            let transportIds = offer.rows.map(el => el.transportid)
            offer.transport = await Transport.findAll({ where: { id: { [Op.in]: transportIds } } })

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
                this_carrier_offer_id,
                transportid
            } = formData

            await Offer.update({
                cost,
                time_from,
                carrier_comment,
                transportid
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

    async delete(req, res, next) {
        try {
            let { id, role } = req.query

            let mover_language
            let member_language

            if (role === 'customer') {
                let offer = await Offer.findOne({ where: { id } })
                let member_userInfoId = offer.dataValues.carrierId
                let mover_userInfoId = offer.dataValues.userInfoId
                let member_userInfo = await UserInfo.findOne({ where: { id: member_userInfoId } })

                member_language = await language_service.setLanguage(member_userInfoId)
                mover_language = await language_service.setLanguage(mover_userInfoId)

                await mail_service.sendUserMail(member_userInfo.dataValues.email,
                    translate_service.setNativeTranslate(member_language,
                        {
                            russian: [`Ваше предложение к аукциону ${offer.dataValues.orderId} отклонено заказчиком`],
                            english: [`Your offer for auction ${offer.dataValues.orderId} has been rejected by customer`]
                        }),
                    translate_service.setNativeTranslate(member_language,
                        {
                            russian: [`Это автоматическое уведомление, ответ не будет прочитан`],
                            english: [`This is an automatic notification, the response will not be read`]
                        }),
                )

                await ServerNotification.findOrCreate({
                    where: {
                        userInfoId: offer.dataValues.carrierId,
                        message: translate_service.setNativeTranslate(member_language,
                            {
                                russian: [`Ваше предложение к аукциону ${offer.dataValues.orderId} отклонено заказчиком`],
                                english: [`Your offer for auction ${offer.dataValues.orderId} has been rejected by customer`]
                            }),
                        type: 'error'
                    },
                    defaults:{uuid:v4()}
                })
            }

            await Offer.destroy({ where: { id: id } })

            if (role === 'customer') {
                return res.send(translate_service.setNativeTranslate(mover_language,
                    {
                        russian: [`Вы отклонили предложение`],
                        english: [`You rejected the offer`]
                    }),)
            } else {
                return res.send('deleted')
            }


        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new OfferController()