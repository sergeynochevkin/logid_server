const ApiError = require('../exceptions/api_error')
const nodemailer = require('nodemailer')
const { Order, UserInfo, Offer, Transport, Translation } = require('../models/models')
const { Op } = require("sequelize")
const { transportHandler } = require('../modules/transportHandler')
const { types } = require('pg')
const translateService = require('../service/translate_service')
const smsService = require('../service/sms_service')
const settingService = require('../service/setting_service')




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
                    english: ['This is an automatic notification, the response will not be read'],
                    spanish: ['Esta es una notificación automática, la respuesta no será leída'],
                    turkish: ['Bu otomatik bir bildirimdir, yanıt okunmayacaktır'],
                    chinese: ['这是自动通知，回复不会被阅读'],
                    hindi: ['यह एक स्वचालित अधिसूचना है, उत्तर पढ़ा नहीं जाएगा'],
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
                        english: ['You have created', order.order_type === 'order' ? 'order' : 'auction', order.id],
                        spanish: ['Tu has creado', order.order_type === 'order' ? 'orden' : 'subasta', order.id],
                        turkish: ['Sen yarattın', order.order_type === 'order' ? 'emir' : 'açık arttırma', order.id],
                        chinese: ['你已经创建了', order.order_type === 'order' ? '命令' : '拍卖', order.id],
                        hindi: ['आपने बनाया है', order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id],
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
                            spanish: ['Recibió una nueva', order.order_type === 'order' ? 'orden' : 'subasta', order.id, 'adecuado para su transporte'],
                            turkish: ['Yeni alındı', order.order_type === 'order' ? 'emir' : 'açık arttırma', order.id, 'ulaşımınız için uygun'],
                            chinese: ['收到新的', order.order_type === 'order' ? '命令' : '拍卖', order.id, '适合您的交通工具'],
                            hindi: ['एक नया प्राप्त हुआ', order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id, 'आपके परिवहन के लिए उपयुक्त'],
                        }
                    )
                }

                // it won't be like that now but it might come in handy in the future
                if (Array.isArray(orderId)) {
                    allMembers_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Поступили новые', order.order_type === 'order' ? 'заказы' : 'аукционы', order.map(el => el.id).toString(), 'подходящие для вашего транспорта'],
                            english: ['New', order.map(el => el.id).toString(), order.order_type === 'order' ? 'orders' : 'auctions', 'received, suitable for your transport'],
                            spanish: ['Llegaron nuevos', order.order_type === 'order' ? 'pedidos' : 'subastas', order.map(el => el.id).toString(), 'adecuado para su transporte'],
                            turkish: ['Yenileri geldi', order.order_type === 'order' ? 'emirler' : 'açık artırmalar', order.map(el => el.id).toString(), 'nakliyeniz için uygun'],
                            chinese: ['新货到了', order.order_type === 'order' ? '命令' : '拍卖', order.map(el => el.id).toString(), '适合您的交通工具'],
                            hindi: ['नए आए हैं', order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.map(el => el.id).toString(), 'आपके परिवहन के लिए उपयुक्त'],
                        }
                    )
                }


                link = `${process.env.CLIENT_URL}?o_i=${order.id}&&o_s=${order.order_status}`

                allMembers_text = translateService.setNativeTranslate(language,
                    {
                        russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                        english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                        spanish: ['Enlace a', order.order_type === 'order' ? 'orden' : 'subasta'],
                        turkish: ['Bağlamak', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                        chinese: ['链接到', order.order_type === 'order' ? '命令' : '拍卖'],
                        hindi: ['से लिंक करें', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
                    }
                )


                let allMembers_text_sms = translateService.setNativeTranslate(language,
                    {
                        russian: ['Новый', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                        english: ['New', order.order_type === 'order' ? 'order' : 'auction'],
                        spanish: ['Nuevo', order.order_type === 'order' ? 'orden' : 'subasta'],
                        turkish: ['Yeni', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                        chinese: ['新的', order.order_type === 'order' ? '命令' : '拍卖'],
                        hindi: ['नया', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
                    }
                )

                if (allWhoHaveTransport.length > 0) {
                    await sendMail([], allMembers_subject, allMembers_text, order, allWhoHaveTransport, link)
                }

                if (userInfos.length > 0) {
                    for (const user of userInfos) {
                        let checkedSetting = await settingService.checkUserAppSetting('sms_messaging', user.id)
                        if (user.country === 'russia' && user.phone !== '' && checkedSetting) {
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
                        english: ['You converted', order.order_type === 'order' ? 'order' : 'auction', order.id, order.order_type === 'order' ? 'to an auction' : 'to an order'],
                        spanish: ['Te convertiste', order.order_type === 'order' ? 'orden' : 'subasta', order.id, order.order_type === 'order' ? 'a una subasta' : 'a una orden'],
                        turkish: ['Dönüştün', order.order_type === 'order' ? 'emir' : 'açık arttırma', order.id, order.order_type === 'order' ? 'açık artırmaya' : 'bir siparişe'],
                        chinese: ['你转换了', order.order_type === 'order' ? '命令' : '拍卖', order.id, order.order_type === 'order' ? '参加拍卖会' : '接到订单'],
                        hindi: ['आपने धर्म परिवर्तन कर लिया', order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id, order.order_type === 'order' ? 'एक नीलामी के लिए' : 'एक आदेश के लिए'],
                    }
                )
                mover_text = response_will_not_be_read
                await sendMail(mover.email, mover_subject, mover_text, order)

                if (offers.length !== 0) {

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? 'Заказ' : 'Аукцион', order.id, 'по которому вы делали предложение', option === 'order' ? 'преобразован в заказ' : 'преобразован в аукцион', order.order_status === 'postponed' ? 'но отложен' : '', order.order_type === 'auction' ? 'вы можете взять в работу на текущих условиях' : '', order.order_status === 'postponed' ? 'когда заказчик его отправит' : ''],
                            english: ['The', order.order_type === 'order' ? 'order' : 'auction', order.id, 'for which you made an offer has been converted into an', order.order_type === 'order' ? 'auction' : 'order', order.order_status === 'postponed' ? 'but has been postponed' : '', order.order_type === 'auction' ? 'you can take an order on current terms' : '', order.order_status === 'postponed' ? 'you can take it to work when the customer sends it' : ''],
                            spanish: [order.order_type === 'order' ? 'Orden' : 'Subasta', order.id, 'por el cual hiciste una oferta', option === 'order' ? 'convertido a orden' : 'convertido a subasta', order.order_status === 'postponed' ? 'pero fue pospuesto' : '', order.order_type === 'auction' ? 'puedes ser contratado en las condiciones actuales' : '', order.order_status === 'postponed' ? 'cuando el cliente lo envía' : ''],
                            turkish: [order.order_type === 'order' ? 'Emir' : 'Açık arttırm', order.id, 'onun için teklifte bulundun', option === 'order' ? 'siparişe dönüştürüldü' : 'açık artırmaya dönüştürüldü', order.order_status === 'postponed' ? 'ama ertelendi' : '', order.order_type === 'auction' ? 'mevcut koşullar altında işe alınabilirsiniz' : '', order.order_status === 'postponed' ? 'müşteri bunu gönderdiğinde' : ''],
                            chinese: [order.order_type === 'order' ? '命令' : '拍卖', order.id, '您提出报价的', option === 'order' ? '转换为订单' : '改为拍卖', order.order_status === 'postponed' ? '但被推迟了' : '', order.order_type === 'auction' ? '您可以在当前条件下被雇用' : '', order.order_status === 'postponed' ? '当客户发送它时' : ''],
                            hindi: [order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id, 'जिसके लिए आपने एक प्रस्ताव दिया था', option === 'order' ? 'ऑर्डर में परिवर्तित किया गया' : 'नीलामी में परिवर्तित किया गया', order.order_status === 'postponed' ? 'लेकिन स्थगित कर दिया गया' : '', order.order_type === 'auction' ? 'आपको वर्तमान परिस्थितियों में काम पर रखा जा सकता है' : '', order.order_status === 'postponed' ? 'जब ग्राहक इसे भेजता है' : ''],
                        }
                    )

                    link = `${process.env.CLIENT_URL}?o_i=${order.id}&&o_s=${order.order_status}`

                    member_text = order.order_status === 'postponed' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                        {
                            russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                            english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                            spanish: ['Enlace a', order.order_type === 'order' ? 'orden' : 'subasta'],
                            turkish: ['Bağlamak', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                            chinese: ['链接到', order.order_type === 'order' ? '命令' : '拍卖'],
                            hindi: ['से लिंक करें', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
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

                        russian: [option === 'create' ? 'Поступило' : option === 'update' ? 'Изменено' : option === 'delete' ? 'Удалено' : '', 'предложение по аукциону', order.id, 'предложений', option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? 'нет' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : ''],

                        english: [option === 'create' ? 'Recieved' : option === 'update' ? 'Updated' : option === 'delete' ? 'Deleted' : '', 'an offer for an auction', order.id, option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? 'no' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : '', 'proposals'],

                        spanish: [option === 'create' ? 'Recibido' : option === 'update' ? 'Actualizado' : option === 'delete' ? 'Eliminado' : '', 'una oferta para una subasta', order.id, option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? 'no' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : '', 'propuestas'],

                        turkish: [option === 'create' ? 'Kabul edilmiş' : option === 'update' ? 'Güncellenmiş' : option === 'delete' ? 'Silindi' : '', 'açık artırma teklifi', order.id, option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? 'hayir' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : '', 'teklifler'],

                        chinese: [option === 'create' ? '已收到' : option === 'update' ? '更新' : option === 'delete' ? '已删除' : '', '拍卖要约', order.id, option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? '不' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : '', '提案'],

                        hindi: [option === 'create' ? 'प्राप्त' : option === 'update' ? 'अद्यतन' : option === 'delete' ? 'हटाए गए' : '', 'नीलामी के लिए एक प्रस्ताव', order.id, option === 'create' ? offers.length : option === 'delete' && offers.length === 1 ? 'नहीं' : option === 'delete' && offers.length !== 1 ? offers.length : option === 'update' ? offers.length : '', 'प्रस्तावों'],

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
                            english: [role === 'carrier' ? 'You have taken an order' : 'You have accepted an auction offer', order.id],
                            spanish: [role === 'carrier' ? 'Has aceptado el pedido' : 'Has aceptado una oferta de subasta', order.id],
                            turkish: [role === 'carrier' ? 'Siparişi kabul ettiniz' : 'Açık artırma teklifini kabul ettiniz', order.id],
                            chinese: [role === 'carrier' ? '您已接受订单' : 'आपने नीलामी प्रस्ताव स्वीकार कर लिया है', order.id],
                            hindi: [role === 'carrier' ? 'आपने आदेश स्वीकार कर लिया है' : '您已接受拍卖报价', order.id],
                        }
                    )

                    mover_text = response_will_not_be_read

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [role === 'carrier' ? 'Ваш' : 'Ваше предложение', order.order_type === 'order' ? `заказ` : `к аукциону`, order.id, role === 'carrier' ? 'взят в работу перевозчиком' : 'принято заказчиком, можете приступать к выполнению'],
                            english: [role === 'carrier' ? 'Your order' : 'Your proposal for auction', order.id, role === 'carrier' ? 'has been taken into work by the carrier' : 'has been accepted by the customer, you can proceed with the implementation'],
                            spanish: [role === 'carrier' ? 'Su pedido' : 'Tu propuesta para subasta', order.id, role === 'carrier' ? 'ha sido puesto a trabajar por el transportista' : 'ha sido aceptado por el cliente, se puede proceder con la implementación'],
                            turkish: [role === 'carrier' ? 'Siparişiniz' : 'Açık artırma teklifiniz', order.id, role === 'carrier' ? 'taşıyıcı tarafından işe alındı' : 'müşteri tarafından kabul edildi, uygulamaya devam edebilirsiniz'],
                            chinese: [role === 'carrier' ? '你的订单' : '您的拍卖提案', order.id, role === 'carrier' ? '已被承运人投入工作' : '已被客户接受，即可继续实施'],
                            hindi: [role === 'carrier' ? 'आपका आदेश' : 'नीलामी के लिए आपका प्रस्ताव', order.id, role === 'carrier' ? 'वाहक द्वारा कार्य में ले लिया गया है' : 'ग्राहक द्वारा स्वीकार कर लिया गया है, आप कार्यान्वयन के साथ आगे बढ़ सकते हैं'],
                        }
                    )

                    link = `${process.env.CLIENT_URL}?o_i=${order.id}&&o_s='inWork'`

                    let member_text_sms = translateService.setNativeTranslate(language,
                        {
                            russian: ['Предложение принято', link],
                            english: ['Your proposal has been taken', link],
                            spanish: ['Tu propuesta ha sido tomada', link],
                            turkish: ['Teklifiniz alındı', link],
                            chinese: ['您的建议已被采纳', link],
                            hindi: ['आपका प्रस्ताव ले लिया गया है', link],
                        }
                    )


                    member_text = translateService.setNativeTranslate(language,
                        {
                            russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                            english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                            spanish: ['Enlace a', order.order_type === 'order' ? 'orden' : 'subasta'],
                            turkish: ['Bağlamak', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                            chinese: ['链接到', order.order_type === 'order' ? '命令' : '拍卖'],
                            hindi: ['से लिंक करें', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
                        }
                    )


                    allMembers_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Ваше предложение к аукциону', order.id, 'было отклонено, заказчик отдал предпочтение другому перевозчику, рассмотрите другие заказы или аукционы'],
                            english: ['Your offer for auction', order.id, 'was rejected, the customer has preferred another carrier, consider other orders or auctions'],
                            spanish: ['Tu oferta de subasta', order.id, 'fue rechazado, el cliente ha preferido otro transportista, considerar otros pedidos o subastas'],
                            turkish: ['Açık artırma teklifiniz', order.id, 'reddedildi, müşteri başka bir taşıyıcıyı tercih etti, diğer siparişleri veya açık artırmaları değerlendirin'],
                            chinese: ['您的拍卖报价', order.id, '被拒绝，客户已选择其他承运商，请考虑其他订单或拍卖'],
                            hindi: ['नीलामी के लिए आपका प्रस्ताव', order.id, 'अस्वीकार कर दिया गया था, ग्राहक ने किसी अन्य वाहक को प्राथमिकता दी है, अन्य ऑर्डर या नीलामी पर विचार करें'],
                        }
                    )

                    allMembers_text = response_will_not_be_read

                    if (role === 'customer') {
                        member = allWhoProposed.find(el => el.id === noPartnerId)
                        if (allWhoProposed.length > 1) {
                            allWhoProposed = allWhoProposed.filter(el => el.id !== noPartnerId).map(el => el.email).toString()
                            await sendMail([], allMembers_subject, allMembers_text, order, allWhoProposed)
                        }

                        if (member) {
                            if (member.phone !== '' && member.country === 'russia') {
                                await smsService.sendSms(member.phone, member_text_sms)
                            }
                        }
                    }

                    await sendMail(mover.email, mover_subject, mover_text, order)

                    if (member) {
                        await sendMail(member.email, member_subject, member_text, order, [], link)                      
                    }                    
                }
                
                // mass processing of orders is not in progress and is not planned
                else if (option === 'completed') {
                    mover_subject = translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы завершили', order.order_type === 'order' ? `заказ` : `аукцион`, order.id],
                            english: ['You have completed', order.order_type === 'order' ? `order` : `auction`, order.id],
                            spanish: ['Has completado', order.order_type === 'order' ? 'orden' : 'subasta', order.id],
                            turkish: ['Bitirdin', order.order_type === 'order' ? 'emir' : 'açık arttırma', order.id],
                            chinese: ['您已完成', order.order_type === 'order' ? '命令' : '拍卖', order.id],
                            hindi: ['आपने पूरा कर लिया है', order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id],
                        }
                    )

                    mover_text = response_will_not_be_read
                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? `Заказ` : `Аукцион`, order.id, 'завершен', role === 'carrier' ? 'перевозчиком' : 'заказчиком'],
                            english: [order.order_type === 'order' ? `Order` : `Auction`, order.id, 'completed by', role === 'carrier' ? 'carrier' : 'customer'],
                            spanish: [order.order_type === 'order' ? 'Orden' : 'Subasta', order.id, 'completado por', role === 'carrier' ? 'transportador' : 'cliente'],
                            turkish: [order.order_type === 'order' ? 'Emir' : 'Açık arttırma', order.id, 'tarafından tamamlanmıştır', role === 'carrier' ? 'taşıyıcı' : 'müşteri'],
                            chinese: [order.order_type === 'order' ? '命令' : '拍卖', order.id, '完成者', role === 'carrier' ? '载体' : '顾客'],
                            hindi: [order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id, 'द्वारा पूर्ण की गयी', role === 'carrier' ? 'वाहक' : 'ग्राहक'],
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
                            spanish: ['Tu cancelaste', order.order_type === 'order' ? `orden` : `subasta`, order.id, role === 'carrier' ? 'por no cargar' : role === 'customer' ? 'debido a la no llegadal' : '', 'esto afecta la calificación del', role === 'carrier' ? 'cliente' : role === 'customer' ? 'transportador. Puedes restaurar el orden' : ''],
                            turkish: ['İptal ettiniz', order.order_type === 'order' ? `emir` : `açık arttırma`, order.id, role === 'carrier' ? 'yüklenmediğinden dolayı' : role === 'customer' ? 'gelmemesi nedeniyle' : '', 'bu derecelendirmeyi etkiler', role === 'carrier' ? 'müşteri' : role === 'customer' ? 'taşıyıcı. Siparişi geri yükleyebilirsiniz' : ''],
                            chinese: ['您取消了', order.order_type === 'order' ? `命令` : `拍卖`, order.id, role === 'carrier' ? '由于未加载' : role === 'customer' ? '由于未到' : '', '这会影响评级', role === 'carrier' ? '顾客' : role === 'customer' ? '载体。 您可以恢复订单' : ''],
                            hindi: ['आपने रद्द कर दिया', order.order_type === 'order' ? `आदेश` : `नीलामी`, order.id, role === 'carrier' ? 'लोड नहीं होने के कारण' : role === 'customer' ? 'न आने के कारण' : '', 'इससे की रेटिंग पर असर पड़ता है', role === 'carrier' ? 'ग्राहक' : role === 'customer' ? 'वाहक। आप ऑर्डर को पुनर्स्थापित कर सकते हैं' : ''],
                        }
                    )

                    mover_text = response_will_not_be_read

                    member_subject = translateService.setNativeTranslate(language,
                        {
                            russian: [order.order_type === 'order' ? 'Заказ' : 'Аукцион', 'отменен в связи c', role === 'carrier' ? 'незагрузкой' : role === 'customer' ? 'неподачей' : '', 'это повлияет на ваш рейтинг'],
                            english: [order.order_type === 'order' ? 'Order' : 'Auction', order.id, 'canceled due to', role === 'carrier' ? 'not loading' : role === 'customer' ? 'non-arrival' : '', 'this will affect your rating'],
                            spanish: [order.order_type === 'order' ? 'Orden' : 'Subasta', order.id, 'cancelado debido a', role === 'carrier' ? 'no cargando' : role === 'customer' ? 'no llegada' : '', 'esto afectará tu calificación'],
                            turkish: [order.order_type === 'order' ? 'Emir' : 'Açık arttırma', order.id, 'nedeniyle iptal edildi', role === 'carrier' ? 'yüklenmiyor' : role === 'customer' ? 'gelmeme' : '', 'bu puanınızı etkileyecektir'],
                            chinese: [order.order_type === 'order' ? '命令' : '拍卖', order.id, '取消由于', role === 'carrier' ? '未加载' : role === 'customer' ? '未到达' : '', '这会影响您的评分'],
                            hindi: [order.order_type === 'order' ? 'आदेश' : 'नीलामी', order.id, 'के कारण रद्द कर दिया गया', role === 'carrier' ? 'लोड नहीं हो रहा है' : role === 'customer' ? 'गैर आगमन' : '', 'इससे आपकी रेटिंग पर असर पड़ेगा'],
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
                                russian: [option === 'canceled' ? 'Вы отменили' : option === 'postponed' ? 'Вы отложили' : option === 'new' ? 'Вы отправили' : option === 'arc' ? 'Вы перенесли в архив' : '', order.order_type === 'order' ? 'заказ' : 'аукцион', order.id],
                                english: [option === 'canceled' ? 'You have canceled' : option === 'postponed' ? 'You have postponed' : option === 'new' ? 'You have sent' : option === 'arc' ? 'You have archived' : '', order.order_type === 'order' ? 'an order' : 'an auction', order.id],

                                spanish: [option === 'canceled' ? 'Has cancelado' : option === 'postponed' ? 'Has pospuesto' : option === 'new' ? 'Has enviado' : option === 'arc' ? 'Has archivadod' : '', order.order_type === 'order' ? 'una orden' : 'una subasta', order.id],

                                turkish: [option === 'canceled' ? 'İptal ettiniz' : option === 'postponed' ? 'Erteledin' : option === 'new' ? 'Gönderdin' : option === 'arc' ? 'Arşivlediniz' : '', order.order_type === 'order' ? 'bir siparişr' : 'açık artırma', order.id],

                                chinese: [option === 'canceled' ? '您已取消' : option === 'postponed' ? '你已经推迟了' : option === 'new' ? '你已经发送' : option === 'arc' ? '您已存档' : '', order.order_type === 'order' ? '订单' : '拍卖', order.id],

                                hindi: [option === 'canceled' ? 'आपने रद्द कर दिया है' : option === 'postponed' ? 'आपने टाल दिया है' : option === 'new' ? 'तुमने भेजा' : option === 'arc' ? 'आपने संग्रहीत कर लिया है' : '', order.order_type === 'order' ? 'एक आदेश' : 'an auction', order.id],
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
                                russian: [option === 'canceled' ? 'Вы отменили' : option === 'postponed' ? 'Вы отложили' : option === 'new' ? 'Вы отправили' : option === 'arc' ? 'Вы перенесли в архив' : '', 'заказы', order.map(el => el.id).sort().toString()],
                                english: [option === 'canceled' ? 'You have canceled' : option === 'postponed' ? 'You have postponed' : option === 'new' ? 'You have sent' : option === 'arc' ? 'You have archived' : '', 'orders', order.map(el => el.id).sort().toString()],
                                spanish: [option === 'canceled' ? 'Has cancelado' : option === 'postponed' ? 'Has pospuesto' : option === 'new' ? 'Has enviado' : option === 'arc' ? 'Has archivadod' : '', 'pedidos', order.map(el => el.id).sort().toString()],
                                turkish: [option === 'canceled' ? 'İptal ettiniz' : option === 'postponed' ? 'Erteledin' : option === 'new' ? 'Gönderdin' : option === 'arc' ? 'Arşivlediniz' : '', 'emirler', order.map(el => el.id).sort().toString()],
                                chinese: [option === 'canceled' ? '您已取消' : option === 'postponed' ? '你已经推迟了' : option === 'new' ? '你已经发送' : option === 'arc' ? '您已存档' : '', '命令', order.map(el => el.id).sort().toString()],
                                hindi: [option === 'canceled' ? 'आपने रद्द कर दिया है' : option === 'postponed' ? 'आपने टाल दिया है' : option === 'new' ? 'तुमने भेजा' : option === 'arc' ? 'आपने संग्रहीत कर लिया है' : '', 'आदेश', order.map(el => el.id).sort().toString()],
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
                                    spanish: [order.order_type === 'order' ? `Orden` : 'Subasta', order.id, 'por el cual hiciste una oferta', option === 'canceled' ? 'fue cancelado' : option === 'postponed' ? 'fue pospuesto' : option === 'new' ? 'ha sido enviado de nuevo' : ''],
                                    turkish: [order.order_type === 'order' ? `Emir` : 'Açık arttırma', order.id, 'onun için teklifte bulundun', option === 'canceled' ? 'iptal edilmişti' : option === 'postponed' ? 'ertelendi' : option === 'new' ? 'tekrar gönderildi' : ''],
                                    chinese: [order.order_type === 'order' ? `命令` : '拍卖', order.id, '您提出报价的', option === 'canceled' ? '取消了 ' : option === 'postponed' ? '被推迟' : option === 'new' ? '已再次发送' : ''],
                                    hindi: [order.order_type === 'order' ? `आदेश` : 'नीलामी', order.id, 'जिसके लिए आपने एक प्रस्ताव दिया था', option === 'canceled' ? 'रद्द कर दिया गया' : option === 'postponed' ? 'स्थगित कर दिया गया' : option === 'new' ? 'दोबारा भेजा गया है' : ''],
                                }
                            )
                        }

                        link = `${process.env.CLIENT_URL}?o_i=${order.id}&&o_s=${order.order_status}`

                        member_text = option !== 'new' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                            {
                                russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                                english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                                spanish: ['Enlace a', order.order_type === 'order' ? 'orden' : 'subasta'],
                                turkish: ['Bağlamak', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                                chinese: ['链接到', order.order_type === 'order' ? '命令' : '拍卖'],
                                hindi: ['से लिंक करें', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
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

                            link = `${process.env.CLIENT_URL}?o_i=${order.id}&&o_s=${order.order_status}`

                            member_text = option !== 'new' ? response_will_not_be_read : translateService.setNativeTranslate(language,
                                {
                                    russian: ['Ссылка на', order.order_type === 'order' ? 'заказ' : 'аукцион'],
                                    english: ['Link to', order.order_type === 'order' ? 'order' : 'auction'],
                                    spanish: ['Enlace a', order.order_type === 'order' ? 'orden' : 'subasta'],
                                    turkish: ['Bağlamak', order.order_type === 'order' ? 'emir' : 'açık arttırma'],
                                    chinese: ['链接到', order.order_type === 'order' ? '命令' : '拍卖'],
                                    hindi: ['से लिंक करें', order.order_type === 'order' ? 'आदेश' : 'नीलामी'],
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
                                        spanish: ['The auction', order.id, 'por el cual hiciste una oferta', option === 'canceled' ? 'fue cancelado' : option === 'postponed' ? 'fue pospuesto' : option === 'new' ? 'ha sido enviado de nuevo' : ''],
                                        turkish: ['The auction', order.id, 'onun için teklifte bulundun', option === 'canceled' ? 'iptal edilmişti' : option === 'postponed' ? 'ertelendi' : option === 'new' ? 'tekrar gönderildi' : ''],
                                        chinese: ['The auction', order.id, '您提出报价的', option === 'canceled' ? '取消了 ' : option === 'postponed' ? '被推迟' : option === 'new' ? '已再次发送' : ''],
                                        hindi: ['The auction', order.id, 'जिसके लिए आपने एक प्रस्ताव दिया था', option === 'canceled' ? 'रद्द कर दिया गया' : option === 'postponed' ? 'स्थगित कर दिया गया' : option === 'new' ? 'दोबारा भेजा गया है' : ''],
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