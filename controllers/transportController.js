const { Transport, Offer, TransportByOrder, Order, TransportViewed } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const fs = require('fs')
const { setNativeTranslate } = require('../service/translate_service')
const language_service = require('../service/language_service');
const { Op } = require('sequelize')
const mail_service = require('../service/mail_service');
const { role_service } = require('./order_controller/role_service');



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
                ad_show,
                ad_name,
                driver_id
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
                ad_name: ad_name.value,
                moderated: ad_show ? 'not_checked' : '',
                driver_id: driver_id.value
            })

            if (ad_show) {
                await mail_service.sendEmailToAdmin(`New transport ${transport.id} for moderation`, `New transport ${transport.id} for moderation`)
            }


            return res.json(transport)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { userInfoId } = req.query
            let role = await role_service(userInfoId)
            let transport;
            if (role === 'driver') {
                transport = await Transport.findAll({ where: { driver_id: userInfoId } })
            } else {
                transport = await Transport.findAll({ where: { userInfoId } })
            }
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
                ad_show,
                ad_name,
                driver_id
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
                ad_show,
                ad_name: ad_name.value,
                driver_id: driver_id.value

            }, { where: { id } })

            if (ad_show) {
                await Transport.update({
                    moderated: 'not_checked'
                }, { where: { id } })
                await mail_service.sendEmailToAdmin(`Updated transport ${id} for moderation`, `Updated transport ${id} for moderation`)

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
                    english: ['Removal is not available. This transport is in active offers and orders in progress'],
                    spanish: ['La eliminación no está disponible. Este transporte se encuentra en ofertas activas y pedidos en curso'],
                    turkish: ['Kaldırma mevcut değil. Bu taşıma aktif tekliflerde olup siparişler devam etmektedir'],
                    chinese: ['无法移除。 该运输正在积极报价中，订单正在进行中。'],
                    hindi: ['निष्कासन उपलब्ध नहीं है. यह परिवहन सक्रिय ऑफ़र में है और ऑर्डर जारी हैं।'],

                })
            }
            else if (offers && offers.length > 0) {
                message = setNativeTranslate(language, {
                    russian: ['Удаление не доступно. Этот транспорт есть в активных предложениях'],
                    english: ['Removal is not available. This transport is in active offers'],
                    spanish: ['La eliminación no está disponible. Este transporte está en ofertas activas'],
                    turkish: ['Kaldırma mevcut değil. Bu ulaşım aktif tekliflerde'],
                    chinese: ['无法移除。 此交通正在积极报价中'],
                    hindi: ['निष्कासन उपलब्ध नहीं है. यह परिवहन सक्रिय ऑफ़र में है'],

                })
            }
            else if (ordersInWork && ordersInWork.length > 0) {
                message = setNativeTranslate(language, {
                    russian: ['Удаление не доступно. Этот транспорт есть в заказах в работе'],
                    english: ['Removal is not available. This transport is orders in progress'],
                    spanish: ['La eliminación no está disponible. Este transporte está en pedidos en curso'],
                    turkish: ['Kaldırma mevcut değil. Bu taşımanın siparişleri devam ediyor'],
                    chinese: ['无法移除。 此运输是根据正在进行中的订单进行的'],
                    hindi: ['निष्कासन उपलब्ध नहीं है. यह परिवहन ऑर्डर पर प्रगति पर है'],

                })
            } else {
                await Transport.destroy({ where: { id: id } })
                await TransportByOrder.destroy({ where: { transportId: id } })
                await TransportViewed.destroy({ where: { transportId: id } })
                fs.rmSync(`./uploads/transport/${id}`, { recursive: true, force: true });
                message = setNativeTranslate('russian', {
                    russian: ['Транспорт удален'],
                    english: ['Transport removed'],
                    spanish: ['Transporte retirado'],
                    turkish: ['Taşıma kaldırıldı'],
                    chinese: ['运输已移除'],
                    hindi: ['परिवहन हटा दिया गया'],

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