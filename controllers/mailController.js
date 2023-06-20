const ApiError = require('../exceptions/api_error')
const nodemailer = require('nodemailer')
const { Order, UserInfo, Offer, Transport, Translation } = require('../models/models')
const { Op } = require("sequelize")
const { transportHandler } = require('../modules/transportHandler')
const { types } = require('pg')
const translateService = require('../service/translate_service')
const smsService = require('../service/sms_service')



class MailController {

    async sendCaptureFormMail(req, res, next) {
        try {
            let {
                phone,
                section,
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
            const sendMail = (email, subject, text) => {
                transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: email,
                    subject: subject,
                    html: `${text}`
                })
            }
            await sendMail('support@logid.app', `New request from form capture, section ${section}`, `Phone: ${phone}`)
            return res.send('mail sent')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async send(req, res, next) {
        try {
            let {
                language,
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
            let userInfos
            let mover_subject
            let mover_text
            let member_subject
            let member_text
            let allMembers_subject
            let allMembers_text
            let link


            let response_will_not_be_read = translateService.setNativeTranslate(language,
                {
                    russian: ['Это автоматическое уведомление, ответ не будет прочитан'],
                    english: ['This is an automatic notification, the response will not be read']
                }
            )


            const sendMail = (email, subject, text, order, group, link) => {
                transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: email ? email : [],
                    bcc: group ? group : [],
                    subject: subject,
                    html: `<div>${text}</div>
                    ${link ? `<div>
                    <a href="${link}">${link && link}</a>
                    </div>` : ''} 
                    `
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
                    mover = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.carrierId) } } }) // array of senders
                    member = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.userInfoId) } } }) // array of recipients
                }
                if (role === 'customer') {
                    member = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.carrierId) } } }) // array of recipients
                    mover = await UserInfo.findAll({ where: { id: { [Op.in]: order.map(el => el.userInfoId) } } }) // array of senders
                }
            }
            // check if this request should always be made
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
                mover_subject = translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы создали', order.order_type === 'order' ? 'заказ' : 'аукцион', order.id],
                        english: ['You have created ', order.order_type === 'order' ? 'order' : 'auction', order.id],
                    }
                )
                mover_text = response_will_not_be_read
                await sendMail(mover.email, mover_subject, mover_text, order)

                // Attention!!! fetch in general of all transport later reduce the selection by city through the UserInfo table
                transports = await Transport.findAll({ where: { type: { [Op.in]: types }, load_capacity: { [Op.in]: load_capacities }, side_type: { [Op.in]: side_types } } })
                transports = transports.map(el => el.userInfoId)

                if (!Array.isArray(orderId)) {
                    userInfos = await UserInfo.findAll({ where: { id: { [Op.in]: transports }, city: order.city } })
                }

                // here it was possible not to divide, but suddenly transport will be needed in the future for mass processing
                if (Array.isArray(orderId)) {
                    userInfos = await UserInfo.findAll({ where: { id: { [Op.in]: transports }, city: { [Op.in]: order.map(el => el.city) } } })
                }

                allWhoHaveTransport = userInfos.map(el => el.email).toString()

                if (!Array.isArray(orderId)) {

                    allMembers_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Поступил новый', order.order_type === 'order' ? 'заказ' : 'аукцион', order.id, 'подходящий для вашего транспорта'],
                            english: ['Received a new', order.order_type === 'order' ? 'order' : 'auction', order.id, 'suitable for your transport'],
                        }
                    )
                }

                // it won't be like that now but it might come in handy in the future
                if (Array.isArray(orderId)) {
                    allMembers_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Поступили новые', order.order_type === 'order' ? 'заказы' : 'аукционы', order.map(el => el.id).toString(), 'подходящие для вашего транспорта'],
                            english: ['New', order.map(el => el.id).toString(), 'orders received, suitable for your transport'],
                        }
                    )
                }


                link = `${process.env.CLIENT_URL}?order_id=${order.id}&&order_status=${order.order_status}`

                allMembers_text = translateService.setNativeTranslate(language,
                    {
                        russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                        english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                    }
                )


                let allMembers_text_sms = translateService.setNativeTranslate(language,
                    {
                        russian: ['Новый', order.order_type === 'order' ? 'заказ' : 'аукцион', link],
                        english: ['New', order.order_type === 'order' ? 'order' : 'auction', link]
                    }
                )

                if (allWhoHaveTransport.length > 0) {
                    await sendMail([], allMembers_subject, allMembers_text, order, allWhoHaveTransport, link)
                }

                if (userInfos.length > 0) {
                    for (const user of userInfos) {
                        if (user.country === 'russia' && user.phone !== '') {
                            //user.phone prepare when reg or put or update
                            let to = user.phone
                            await smsService.sendSms(to, allMembers_text_sms)
                        }
                    }
                }

            }

            // mass processing is not planned
            if (mailFunction === 'order_type') {
                mover_subject = translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы преобразовали', order.order_type === 'order' ? 'заказ' : 'аукцион', order.id, 'в', order.order_type === 'order' ? 'аукцион' : 'заказ'],
                        english: ['You converted', order.order_type === 'order' ? 'order' : 'auction', order.id, 'to', order.order_type === 'order' ? 'to an auction' : 'to an order'],
                    }
                )
                mover_text = response_will_not_be_read
                await sendMail(mover.email, mover_subject, mover_text, order)

                if (offers.length !== 0) {

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? 'Заказ' : 'Аукцион', order.id, 'по которому вы делали предложение', option === 'order' ? 'преобразован в заказ' : 'преобразован в аукцион', order.order_status === 'postponed' ? 'но отложен' : '', order.order_type === 'auction' ? 'вы можете взять в работу на текущих условиях' : '', order.order_status === 'postponed' ? 'когда заказчик его отправит' : ''],
                            english: ['The', order.order_type === 'order' ? 'order' : 'auction', order.id, 'for which you made an offer has been converted into an', order.order_type === 'order' ? 'auction' : 'order', order.order_status === 'postponed' ? 'but has been postponed' : '', order.order_type === 'auction' ? 'you can take an order on current terms' : '', order.order_status === 'postponed' ? 'you can take it to work when the customer sends it' : ''],
                        }
                    )

                    link = `${process.env.CLIENT_URL}?order_id=${order.id}&&order_status=${order.order_status}`

                    member_text = order.order_status === 'postponed' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                        {
                            russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                            english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                        }
                    )


                    allWhoProposed = allWhoProposed.map(el => el.email).toString()
                    await sendMail([], member_subject, member_text, order, allWhoProposed, link)
                }
            }
            // mass processing is not planned
            if (mailFunction === 'offer') {

                member_subject = translateService.setNativeTranslate(language,
                    {
                        russian: [option === 'create' ? 'Поступило' : option === 'update' ? 'Изменено' : option === 'delete' ? 'Удалено' : '', 'предложение по аукциону', order.id, 'предложений', option === 'create' ? offers.length + 1 : option === 'delete' && offers.length === 1 ? 'нет' : option === 'delete' && offers.length !== 1 ? offers.length - 1 : option === 'update' ? offers.length : ''],
                        english: [option === 'create' ? 'Recieved' : option === 'update' ? 'Updated' : option === 'delete' ? 'Deleted' : '', 'an offer for an auction', order.id, option === 'create' ? offers.length + 1 : option === 'delete' && offers.length === 1 ? 'нет' : option === 'delete' && offers.length !== 1 ? offers.length - 1 : option === 'update' ? offers.length : '', 'proposals'],
                    }
                )

                member_text = response_will_not_be_read
                await sendMail(member.email, member_subject, member_text, order)
            }
            if (mailFunction === 'order_status') {
                // the carrier cannot take several orders to work at the same time, and the customer cannot take several offers mass processing is not planned
                if (option === 'inWork') {
                    mover_subject = `${role === 'carrier' ? 'Вы взяли в работу' : 'Вы приняли предложение'} ${order.order_type === 'order' ? `заказ` : `по аукциону`} ${order.id}`
                    mover_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [role === 'carrier' ? 'Вы взяли в работу заказ' : 'Вы приняли предложение по аукциону', order.id],
                            english: [role === 'carrier' ? 'You have taken an' : 'You have accepted an auction', role === 'carrier' ? 'order' : 'offer', order.id],
                        }
                    )

                    mover_text = response_will_not_be_read

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [role === 'carrier' ? 'Ваш' : 'Ваше предложение', order.order_type === 'order' ? `заказ` : `к аукциону`, order.id, role === 'carrier' ? 'взят в работу перевозчиком' : 'принято заказчиком, можете приступать к выполнению'],
                            english: [role === 'carrier' ? 'Ваш заказ' : 'Your proposal for auction', order.id, role === 'carrier' ? 'has been taken into work by the carrier' : 'has been accepted by the customer, you can proceed with the implementation'],
                        }
                    )

                    link = `${process.env.CLIENT_URL}?order_id=${order.id}&&order_status='inWork'`

                    let member_text_sms = translateService.setNativeTranslate(language,
                        {
                            russian: ['Ваше ппедложение принято', link],
                            english: ['Your proposal has been taken', link]
                        }
                    )


                    member_text = translateService.setNativeTranslate(language,
                        {
                            russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                            english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                        }
                    )


                    allMembers_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Ваше предложение к аукциону', order.id, 'было отклонено, заказчик отдал предпочтение другому перевозчику, рассмотрите другие заказы или аукционы'],
                            english: ['Your offer for auction', order.id, 'was rejected, the customer has preferred another carrier, consider other orders or auctions'],
                        }
                    )

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
                        await sendMail(member.email, member_subject, member_text, order, [], link)
                        if (member.phone !== '' && member.country === 'russia') {
                            await smsService.sendSms(member.phone, member_text_sms)
                        }
                    }
                }
                // mass processing of orders is not in progress and is not planned
                else if (option === 'completed') {
                    mover_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы завершили', order.order_type === 'order' ? `заказ` : `аукцион`, order.id],
                            english: ['You have completed', order.order_type === 'order' ? `order` : `auction`, order.id],
                        }
                    )

                    mover_text = response_will_not_be_read
                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? `Заказ` : `Аукцион`, order.id, 'завершен', role === 'carrier' ? 'перевозчиком' : 'заказчиком'],
                            english: [order.order_type === 'order' ? `Order` : `Auction`, order.id, 'completed by', role === 'carrier' ? 'carrier' : 'customer'],
                        }
                    )

                    member_text = response_will_not_be_read
                    await sendMail(mover.email, mover_subject, mover_text, order)
                    await sendMail(member.email, member_subject, member_text, order)
                }
                // non-submission, non-loading mass processing is not planned
                else if (option === 'disrupt') {

                    mover_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы отменили', order.order_type === 'order' ? `заказ` : `аукцион`, order.id, 'в связи с', role === 'carrier' ? 'незагрузкой' : role === 'customer' ? 'неподачей' : '', 'это повлияет на рейтинг', role === 'carrier' ? 'заказчика' : role === 'customer' ? 'перевозчика. Вы можете восстановить заказ' : ''],
                            english: ['You canceled the', order.order_type === 'order' ? `order` : `auction`, order.id, role === 'carrier' ? 'due to not loading' : role === 'customer' ? 'due to non-arrival' : '', 'this affects the rating of the', role === 'carrier' ? 'customer' : role === 'customer' ? 'carrier. You can restore the order' : ''],
                        }
                    )

                    mover_text = response_will_not_be_read

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? 'Заказ' : 'Аукцион', 'отменен в связи c', role === 'carrier' ? 'незагрузкой' : role === 'customer' ? 'неподачей' : '', 'это повлияет на ваш рейтинг'],
                            english: [order.order_type === 'order' ? 'Order' : 'Auction', order.id, ' canceled due to', role === 'carrier' ? 'not loading' : role === 'customer' ? 'non-arrival' : '', 'this will affect your rating'],
                        }
                    )
                    member_text = response_will_not_be_read
                    await sendMail(mover.email, mover_subject, mover_text, order)
                    await sendMail(member.email, member_subject, member_text, order)
                }
                else {
                    if (!Array.isArray(orderId)) {
                        mover_subject = translateService.setNativeTranslate(language,
                            {
                                russian: [option === 'canceled' ? 'Вы отменили' : option === 'postponed' ? 'Вы отложили' : option === 'new' ? 'Вы отправили' : option === 'arc' ? 'Вы перенсли в архив' : '', order.order_type === 'order' ? 'заказ' : 'аукцион', order.id],
                                english: [option === 'canceled' ? 'You have canceled' : option === 'postponed' ? 'You have postponed' : option === 'new' ? 'You have sent' : option === 'arc' ? 'You have archived' : '', order.order_type === 'order' ? 'an order' : 'an auction', order.id],
                            }
                        )
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
                        mover_subject = translateService.setNativeTranslate(language,
                            {
                                russian: [option === 'canceled' ? 'Вы отменили' : option === 'postponed' ? 'Вы отложили' : option === 'new' ? 'Вы отправили' : option === 'arc' ? 'Вы перенсли в архив' : '', 'заказы', order.map(el => el.id).sort().toString()],
                                english: [option === 'canceled' ? 'You have canceled' : option === 'postponed' ? 'You have postponed' : option === 'new' ? 'You have sent' : option === 'arc' ? 'You have archived' : '', 'orders', order.map(el => el.id).sort().toString()],
                            }
                        )
                        mover_text = response_will_not_be_read
                        await sendMail(mover.map(el => el.email).toString(), mover_subject, mover_text, order)
                    }
                    if (!Array.isArray(orderId)) {
                        if (offers.length !== 0 && order.order_type === 'auction' && option !== 'arc') {

                            member_subject = translateService.setNativeTranslate(language,
                                {
                                    russian: [order.order_type === 'order' ? `Заказ` : `Аукцион`, order.id, 'по которомы вы делали предложение', option === 'canceled' ? 'отменен' : option === 'postponed' ? 'отложен' : option === 'new' ? 'снова отправлен' : ''],
                                    english: [order.order_type === 'order' ? `The order` : 'The auction', order.id, 'for which you made an offer', option === 'canceled' ? 'was canceled' : option === 'postponed' ? 'was postponed' : option === 'new' ? 'has been sent again' : ''],
                                }
                            )
                        }

                        link = `${process.env.CLIENT_URL}?order_id=${order.id}&&order_status=${order.order_status}`

                        member_text = option !== 'new' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                            {
                                russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                                english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                            }
                        )


                        if (allWhoProposed) {
                            if (allWhoProposed.length > 0 && option !== 'arc') {
                                allWhoProposed = allWhoProposed.map(el => el.email).toString()
                                await sendMail(allWhoProposed, member_subject, member_text, order, [], link)
                            }
                        }
                    }
                    // sending by mass processing, but letters for each order to everyone who made an offer, this is logical, since activities will occur at different times and from different users
                    if (Array.isArray(orderId)) {
                        member_text = response_will_not_be_read
                        order.forEach(async order => {

                            link = `${process.env.CLIENT_URL}?order_id=${order.id}&&order_status=${order.order_status}`

                            member_text = option !== 'new' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                                {
                                    russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                                    english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                                }
                            )

                            offers = await Offer.findAll({ where: { orderId: order.id } })
                            if (offers.length > 0) {
                                offers = offers.map(el => el.carrierId)
                                allWhoProposed = await UserInfo.findAll({ where: { id: { [Op.in]: offers } } })

                                member_subject = translateService.setNativeTranslate(language,
                                    {
                                        russian: [`Аукцион`, order.id, 'по которому вы делали предложение', option === 'canceled' ? 'отменен' : option === 'postponed' ? 'отложен' : option === 'new' ? 'снова отправлен' : ''],
                                        english: ['The auction', order.id, 'for which you made an offer', option === 'canceled' ? 'was canceled' : option === 'postponed' ? 'was postponed' : option === 'new' ? 'has been sent again' : ''],
                                    }
                                )

                                allWhoProposed = allWhoProposed.map(el => el.email).toString()
                                await sendMail(allWhoProposed, member_subject, member_text, order, [], option === 'new' ? link : '')
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