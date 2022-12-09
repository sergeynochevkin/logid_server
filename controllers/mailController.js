const ApiError = require('../exceptions/api_error')
const nodemailer = require('nodemailer')
const { Order, UserInfo, Offer, Transport, Translation } = require('../models/models')
const { Op } = require("sequelize")
const { transportHandler } = require('../modules/transportHandler')
const { types } = require('pg')
const translateService = require('../service/translate_service')

class MailController {
    async send(req, res, next) {
        try {
            let {
                role,
                orderId,
                mailFunction,
                option,
                noPartnerId
            } = req.body
            const transport = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                secure: true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            })
            let order
            let mover
            let member
            let offers
            let transports
            let allWhoProposed
            let allWhoHaveTransport
            let mover_subject
            let mover_text
            let member_subject
            let member_text
            let allMembers_subject
            let allMembers_text

            let language = 'english'
            let response_will_not_be_read = await Translation.findOne({ where: { service: 'response_will_not_be_read', type: 'notification' } })
            response_will_not_be_read = response_will_not_be_read[language]
            let notifications = await Translation.findAll({ where: { type: 'notification' } })//или каждый раз спрашивать у базы?

            const sendMail = (email, subject, text, order, group) => {
                transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: email ? email : [],
                    bcc: group ? group : [],
                    subject: subject,
                    html: `${text}`
                })
            }
            if (!Array.isArray(orderId)) {
                order = await Order.findOne({ where: { id: orderId } })
                if (role === 'carrier') {
                    mover = await UserInfo.findOne({ where: { id: order.carrierId } })
                    member = await UserInfo.findOne({ where: { id: order.userInfoId } })
                }
                if (role === 'customer') {
                    member = await UserInfo.findOne({ where: { id: order.carrierId } })
                    mover = await UserInfo.findOne({ where: { id: order.userInfoId } })
                }
            }
            if (Array.isArray(orderId)) {
                order = await Order.findAll({ where: { id: { [Op.in]: orderId } } })
                if (role === 'carrier') {
                    mover = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.carrierId) } } }) // массив отправителей
                    member = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.userInfoId) } } }) // массив получателей
                }
                if (role === 'customer') {
                    member = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.carrierId) } } }) // массив получателей
                    mover = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.userInfoId) } } }) // массив отправителей
                }
            }
            // проверить, всегда ли надо делать этот запрос
            if (!Array.isArray(orderId)) {
                offers = await Offer.findAll({ where: { orderId: order.id } })
                if (offers.length > 0) {
                    offers = offers.map(el => el.carrierId)
                    allWhoProposed = await UserInfo.findAll({ where: { id: { [Op.in]: offers } } })
                }
            }
            if (mailFunction === 'new_order') {
                transports = Transport.findAll({ where: {} })
                let types
                let load_capacities
                let side_types
                if (!Array.isArray(orderId)) {
                    types = [order.type]
                    load_capacities = [order.load_capacity]
                    side_types = [order.side_type]
                }
                if (Array.isArray(orderId)) {
                    types = order.map(el => el.type)
                    load_capacities = order.map(el => el.load_capacity)
                    side_types = order.map(el => el.side_type)
                }
                transportHandler(types, load_capacities, side_types)
                mover_subject = `Вы создали ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id}`
                mover_text = response_will_not_be_read
                await sendMail(mover.email, mover_subject, mover_text, order)

                // внимание!!! фетч вообще всего транспорта позднее уменьшить выборку по городу через UserInfo таблицу
                transports = await Transport.findAll({ where: { type: { [Op.in]: types }, load_capacity: { [Op.in]: load_capacities }, side_type: { [Op.in]: side_types } } })
                transports = transports.map(el => el.userInfoId)

                if (!Array.isArray(orderId)) {
                    allWhoHaveTransport = await UserInfo.findAll({ where: { id: { [Op.in]: transports }, city: order.city } })
                }

                // здесь возможно можно было не делить, но вдруг транспорт в будущем понадобится и при массовой обработке
                if (Array.isArray(orderId)) {
                    allWhoHaveTransport = await UserInfo.findAll({ where: { id: { [Op.in]: transports }, city: { [Op.in]: order.map(el => el.city) } } })
                }
                allWhoHaveTransport = allWhoHaveTransport.map(el => el.email).toString()

                if (!Array.isArray(orderId)) {
                    allMembers_subject = `В вашем городе появился новый ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id} подходящий для вашего транспорта`
                }

                // сейчас так не будет но вдруг пригодится в будущем
                if (Array.isArray(orderId)) {
                    allMembers_subject = `В вашем городе появились новые заказы ${order.map(el => el.id).toString()} подходящие для вашего транспорта`
                }

                allMembers_text = response_will_not_be_read

                if (allWhoHaveTransport.length > 0) {
                    await sendMail([], allMembers_subject, allMembers_text, order, allWhoHaveTransport)
                }
            }
            // массовая обработка не планируется
            if (mailFunction === 'order_type') {
                mover_subject = `Вы преобразовали ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id} в ${option === 'order' ? `заказ` : `аукцион`}`
                mover_text = response_will_not_be_read
                await sendMail(mover.email, mover_subject, mover_text, order)

                if (offers.length !== 0) {
                    member_subject = `${order.order_type === 'order' ? `Заказ` : `Аукцион`} ${order.id}, по которому вы делали предложение ${option === 'order' ? `преобразован в заказ ${order.order_status === 'postponed' ? ', но отложен' : ''} вы можете взять его в работу на текущих условиях ${order.order_status === 'postponed' ? ', когда заказчик его отправит' : ''}` : `снова преобразован в аукцион, ожидайте решения заказчика`}`
                    member_text = response_will_not_be_read
                    allWhoProposed = allWhoProposed.map(el => el.email).toString()
                    await sendMail([], member_subject, member_text, order, allWhoProposed)
                }
            }
            // массовая обработка не планируется
            if (mailFunction === 'offer') {
                member_subject = `По вашему аукциону ${order.id} ${option === 'create' ? 'поступило новое' : option === 'update' ? 'изменено' : option === 'delete' ? 'удалено' : ''} предложение, предложений ${option === 'create' ? offers.length + 1 : option === 'delete' && offers.length === 1 ? 'нет'
                    : option === 'delete' && offers.length !== 1 ? offers.length - 1
                        : option === 'update' ? offers.length : ''
                    }`
                member_text = response_will_not_be_read
                await sendMail(member.email, member_subject, member_text, order)
            }
            if (mailFunction === 'order_status') {
                // перевозчик не может взять одновременно несколько заказов в работу, а заказчик не может несколько предложений массовая обработка не планируется
                if (option === 'inWork') {
                    mover_subject = `${role === 'carrier' ? 'Вы взяли в работу' : 'Вы приняли предложение'} ${order.order_type === 'order' ? `заказ` : `по аукциону`} ${order.id}`
                    mover_text = response_will_not_be_read

                    member_subject = `${role === 'carrier' ? 'Ваш' : 'Ваше предложение'} ${order.order_type === 'order' ? `заказ` : ` к аукциону`} ${order.id} ${role === 'carrier' ? 'взят в работу перевозчиком' : 'принято заказчиком, можете приступать к выполнению'}`
                    member_text = response_will_not_be_read

                    allMembers_subject = `Ваше предложение к аукциону ${order.id} было отклонено, заказчик отдал предпочтение другому перевозчику, рассмотрите другие заказы или аукционы`
                    allMembers_text = response_will_not_be_read
                    if (role === 'customer') {
                        member = allWhoProposed.find(el => el.id === noPartnerId)
                        if (allWhoProposed.length > 1) {
                            allWhoProposed = allWhoProposed.filter(el => el.id !== noPartnerId).map(el => el.email).toString()
                            await sendMail([], allMembers_subject, allMembers_text, order, allWhoProposed)
                        }
                    }
                    await sendMail(mover.email, mover_subject, mover_text, order)
                    if (member) {
                        await sendMail(member.email, member_subject, member_text, order)
                    }
                }
                // массовой обработки у заказов в работе нет и не планируется
                else if (option === 'completed') {
                    mover_subject = `Вы завершили ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id}`
                    mover_text = response_will_not_be_read
                    member_subject = `${order.order_type === 'order' ? `Заказ` : `Аукцион`} ${order.id} завершен ${role === 'carrier' ? 'перевозчиком' : 'заказчиком'}`
                    member_text = response_will_not_be_read
                    await sendMail(mover.email, mover_subject, mover_text, order)
                    await sendMail(member.email, member_subject, member_text, order)
                }
                // неподача, незагрузка массовая обработка не планируется
                else if (option === 'disrupt') {
                    mover_subject = `Вы отменили ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id} в связи с ${role === 'carrier' ? 'незагрузкой' : role === 'customer' ? 'неподачей' : ''} это повлияет на рейтинг ${role === 'carrier' ? 'заказчика' : role === 'customer' ? 'перевозчика. Вы можете восстановить заказ' : ''}`
                    mover_text = response_will_not_be_read
                    member_subject = `${order.order_type === 'order' ? `Заказ` : `Аукцион`} ${order.id} отменен в связи с ${role === 'carrier' ? 'незагрузкой' : role === 'customer' ? 'неподачей' : ''} это повлияет на ваш рейтинг`
                    member_text = response_will_not_be_read
                    await sendMail(mover.email, mover_subject, mover_text, order)
                    await sendMail(member.email, member_subject, member_text, order)
                }
                else {
                    if (!Array.isArray(orderId)) {
                        mover_subject = `Вы ${option === 'canceled' ? 'отменили' : option === 'postponed' ? 'отложили' : option === 'new' ? 'отправили' : option === 'arc' ? 'перенесли' : ''} ${order.order_type === 'order' ? `заказ` : `аукцион`} ${order.id} ${option === 'arc' ? 'в архив' : ''}`
                        mover_text = response_will_not_be_read
                        await sendMail(mover.email, mover_subject, mover_text, order)
                    }
                    const sort = (a, b) => {
                        if (a < b) {
                            return -1;
                        }
                        if (a > b) {
                            return 1;
                        }
                    }
                    if (Array.isArray(orderId)) {
                        mover_subject = `Вы ${option === 'canceled' ? 'отменили' : option === 'postponed' ? 'отложили' : option === 'new' ? 'отправили' : option === 'arc' ? 'перенесли' : ''} ${order.length === 1 ? 'заказ' : 'заказы'} ${order.map(el => el.id).sort().toString()} ${option === 'arc' ? 'в архив' : ''}`
                        mover_text = response_will_not_be_read
                        await sendMail(mover.map(el => el.email).toString(), mover_subject, mover_text, order)
                    }
                    if (!Array.isArray(orderId)) {
                        if (offers.length !== 0 && order.order_type === 'auction' && option !== 'arc') {
                            member_subject = `${order.order_type === 'order' ? `Заказ` : `Аукцион`} ${order.id} по которому вы делали предложение ${option === 'canceled' ? 'отменен' : option === 'postponed' ? 'отложен' : option === 'new' ? 'снова отправлен' : ''} `
                        }
                        member_text = response_will_not_be_read
                        if (allWhoProposed) {
                            if (allWhoProposed.length > 0 && option !== 'arc') {
                                allWhoProposed = allWhoProposed.map(el => el.email).toString()
                                await sendMail(allWhoProposed, member_subject, member_text, order)
                            }
                        }
                    }
                    // отправка по массовой обработке но письма по каждому заказу каждому кто делал предложение, это логично, так как активности будут происходить в разное время и от разных пользователей
                    if (Array.isArray(orderId)) {
                        member_text = response_will_not_be_read
                        order.forEach(async order => {
                            offers = await Offer.findAll({ where: { orderId: order.id } })
                            if (offers.length > 0) {
                                offers = offers.map(el => el.carrierId)
                                allWhoProposed = await UserInfo.findAll({ where: { id: { [Op.in]: offers } } })
                                member_subject = `Аукцион  ${order.id} по которому вы делали предложение ${option === 'canceled' ? 'отменен' : option === 'postponed' ? 'отложен' : option === 'new' ? 'снова отправлен' : ''} `
                                allWhoProposed = allWhoProposed.map(el => el.email).toString()
                                await sendMail(allWhoProposed, member_subject, member_text, order)
                            }
                        })
                    }
                }
            }
            return res.send('mail sent')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new MailController()