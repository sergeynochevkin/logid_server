const { Transport, Offer, TransportByOrder, Order } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const fs = require('fs')
const { setNativeTranslate } = require('../service/translate_service')
const language_service = require('../service/language_service');
const { Op } = require('sequelize')



class TransportController {

    async create(req, res, next) {

        try {
            let {
                formData
            } = req.body

            let {
                type,
                load_capacity,
                side_type,
                userInfoId,
                tag,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                ad_text,
                ad_show
            } = formData

            let transport = await Transport.create({
                type: type.value,
                load_capacity: load_capacity.value,
                side_type: side_type.value,
                userInfoId,
                tag: tag.value,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                ad_text: ad_text.value,
                ad_show,
                moderated:ad_show ? 'not_checked' : ''
            })

        

            return res.json(transport)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { userInfoId } = req.query
            let transport;
            transport = await Transport.findAll({ where: { userInfoId } })
            return res.json(transport)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res) {

    }

    async update(req, res, next) {

        try {
            let {
                formData
            } = req.body

            let {
                id,
                type,
                load_capacity,
                side_type,
                userInfoId,
                tag,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                ad_text,
                ad_show
            } = formData

            let transport = await Transport.findOne({ where: { id } })

            let transportForRes = await Transport.update({
                type: type.value,
                load_capacity: load_capacity.value,
                side_type: side_type.value,
                userInfoId,
                tag: tag.value,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                ad_text: ad_text.value,
                ad_show
            }, { where: { id } })

            if (ad_show) {
                await Transport.update({
                    moderated: 'not_checked'
                }, { where: { id } })
            }

            if (transport.dataValues.from_fast) {
                await Transport.update({
                    from_fast: false
                }, { where: { id } })
            }

            return res.json(transportForRes)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            let { id } = req.query
            let message
            let transport = await Transport.findOne({ where: { id } })
            let language = await language_service.setLanguage(transport.dataValues.userInfoId)
            let offers = await Offer.findAll({ where: { transportid: id } })
            let orders = await TransportByOrder.findAll({ where: { transportId: id } })
            let orderIds = orders.map(el => el.orderId)
            let ordersInWork = await Order.findAll({ where: { id: { [Op.in]: orderIds }, order_status: 'inWork' } })


            //moving to saved logics!

            if ((offers && offers.length > 0) && (ordersInWork && ordersInWork.length > 0)) {
                message = setNativeTranslate(language, {
                    russian: ['Удаление не доступно. Этот транспорт есть в активных предложениях и заказах в работе'],
                    english: ['Removal is not available. This transport is in active offers and orders in progress']
                })
            }
            else if (offers && offers.length > 0) {
                message = setNativeTranslate(language, {
                    russian: ['Удаление не доступно. Этот транспорт есть в активных предложениях'],
                    english: ['Removal is not available. This transport is in active offers']
                })
            }
            else if (ordersInWork && ordersInWork.length > 0) {
                message = setNativeTranslate(language, {
                    russian: ['Удаление не доступно. Этот транспорт есть в заказах в работе'],
                    english: ['Removal is not available. This transport is orders in progress']
                })
            } else {
                await Transport.destroy({ where: { id: id } })
                await TransportByOrder.destroy({ where: { transportId: id } })
                fs.rmSync(`./uploads/transport/${id}`, { recursive: true, force: true });
                message = setNativeTranslate('russian', {
                    russian: ['Транспорт удален'],
                    english: ['Transport removed']
                })
            }

            return res.send(message)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new TransportController()