const { Order, ServerNotification, Point, UserInfo, User } = require('../models/models')
const { Op } = require("sequelize")
const nodemailer = require('nodemailer');
const translateService = require('../service/translate_service')

module.exports = async function (handlerArgs) {
    console.log(`${handlerArgs.statusArray.toString()} to ${handlerArgs.newStatus} handling started...`);

    const sortOrders = (a, b) => {
        if (a.id > b.id) {
            return 1
        } else if (a.id < b.id) {
            return -1
        } else {
            return 0
        }
    }

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

    const sendMail = (email, subject, text, group) => {
        transport.sendMail({
            from: process.env.MAIL_FROM,
            to: email ? email : [],
            bcc: group ? group : [],
            subject: subject,
            html: `${text}`
        })
    }

    let orders
    let points
    let ordersForNotification = []
    let ordersForStatusUpdate = []
    let ordersForTypeUpdate = []
    let dateNow = new Date()
    let notificationDelay = handlerArgs.notificationDelayInDays * 1000 * 60 * 60 * 12
    let actionDelay = handlerArgs.actionDelayInDays * 1000 * 60 * 60 * 12
    await Order.findAll({ where: { order_status: { [Op.in]: handlerArgs.statusArray } } }).then(data => {
        orders = data
    })
    let userInfoIds = orders.map(el => el.userInfoId)
    let userInfos
    await UserInfo.findAll({ where: { id: { [Op.in]: userInfoIds } } }).then(data => {
        userInfos = data
    })

    for (const userInfo of userInfos) {

        let role
        await User.findOne({ where: { id: userInfo.userId } }).then(data => { role = data.role })

        let thisUserOrders
        if (handlerArgs.newStatus === 'arc' && role === 'customer') {
            thisUserOrders = orders.filter(el => el.userInfoId === userInfo.id && el.customer_arc_status !== 'arc')
        } else if (handlerArgs.newStatus === 'arc' && role === 'carrier') {
            thisUserOrders = orders.filter(el => el.userInfoId === userInfo.id && el.carrier_arc_status !== 'arc')
        }
        else {
            thisUserOrders = orders.filter(el => el.userInfoId === userInfo.id)
        }

        if (thisUserOrders.length > 1) {
            thisUserOrders = thisUserOrders.sort(sortOrders)
        }

        for (const element of thisUserOrders) {
            await Point.findAll({ where: { [Op.and]: { orderIntegrationId: element.pointsIntegrationId, sequence: 1 } } }).then(data => { points = data })
            let firstPoint = points.find(el => el.sequence === 1)
            let poinSequences = points.map(el => el.sequence)
            let maxSequence = Math.max(...poinSequences)
            let lastPoint = points.find(el => el.sequence === maxSequence)

            //notifications!
            //check notification interval regarding last update not new orders and not in work
            if (element.updatedAt < (dateNow - notificationDelay) && element.updatedAt > (dateNow - actionDelay) && !handlerArgs.statusArray.includes('new') && !handlerArgs.statusArray.includes('inWork')) {
                ordersForNotification.push(element.id)
            }
            //checking the notification interval relative to the last point orders in work
            if (lastPoint && lastPoint.time < (dateNow - notificationDelay) && lastPoint.time > (dateNow - actionDelay) && handlerArgs.statusArray.includes('inWork')) {
                ordersForNotification.push(element.id)
            }
            //checking the interval relative to the first point new orders of type auction offer change type
            if (firstPoint && firstPoint.time < (dateNow - (lastPoint.time - firstPoint.time) * 0.75) && (lastPoint.time > (dateNow - notificationDelay)) && element.order_type === 'order' && handlerArgs.statusArray.includes('new')) {
                ordersForTypeUpdate.push(element.id)
            }
            //checking the notification interval regarding the last point new orders
            if (lastPoint && lastPoint.time < (dateNow - notificationDelay) && lastPoint.time > (dateNow - actionDelay) && handlerArgs.statusArray.includes('new')) {
                ordersForNotification.push(element.id)
            }

            //updates!
            //checking the interval relative to the time of the last update not orders in progress and not new
            if (element.updatedAt < (dateNow - actionDelay) && !handlerArgs.statusArray.includes('inWork') && !handlerArgs.statusArray.includes('new')) {
                ordersForStatusUpdate.push(element.id)
            }
            //check interval relative to last update time orders in progress
            if (lastPoint && lastPoint.time < (dateNow - actionDelay) && (handlerArgs.statusArray.includes('inWork') || handlerArgs.statusArray.includes('new'))) {
                ordersForStatusUpdate.push(element.id)
            }

        };

        let text = translateService.setTranslate(
            {
                russian: ['Это автоматическое уведомление, ответ не будет прочитан'],
                english: ['This is an automatic notification, the response will not be read']
            }
        )
        let message
        if (ordersForStatusUpdate.length > 0) {
            message = translateService.setTranslate(
                {
                    russian: [ordersForStatusUpdate.length > 1 ? 'Заказы' : 'Заказ', ordersForStatusUpdate.toString(), 'автоматически', ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'arc' ? 'перенесены в архив' :
                        ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'arc' ? 'перенесен в архив' : ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'canceled' ? 'отменены' : ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'canceled' ? 'отменен'
                            : ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'completed' ? 'завершены' : ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'completed' ? 'завершен'
                                : ''],
                    english: [ordersForStatusUpdate.length > 1 ? 'Orders' : 'Order', ordersForStatusUpdate.toString(), 'atomatically', handlerArgs.newStatus === 'arc' ? 'moved to archive' : handlerArgs.newStatus === 'canceled' ? 'canceled' : handlerArgs.newStatus === 'completed' ? 'completed' : '']
                }
            )

            if (handlerArgs.newStatus === 'arc') {
                await Order.update({ order_status: handlerArgs.newStatus, order_final_status: handlerArgs.statusArray[0], carrier_arc_status: handlerArgs.newStatus, customer_arc_status: handlerArgs.newStatus }, { where: { id: { [Op.in]: ordersForStatusUpdate } } })
            } else {
                await Order.update({ order_status: handlerArgs.newStatus, order_final_status: handlerArgs.statusArray[0] }, { where: { id: { [Op.in]: ordersForStatusUpdate } } })
            }

            await ServerNotification.findOrCreate({
                where: {
                    userInfoId: userInfo.id,
                    message: message,
                    type: handlerArgs.newStatus === 'completed' || handlerArgs.newStatus === 'arc' ? 'success' : handlerArgs.newStatus === 'canceled' ? 'error' : ''
                }
            }).then(async data => {
                if (data[1] === true) {
                    await sendMail(userInfo.email, message, text)
                }
            })
        }

        if (ordersForNotification.length > 0) {
            message = translateService.setTranslate(
                {
                    russian: [ordersForNotification.length > 1 ? 'Заказы' : 'Заказ', ordersForNotification.toString(), 'завтра', ordersForNotification.length > 1 ? 'будут' : 'будет', 'автоматически', ordersForNotification.length > 1 && handlerArgs.newStatus === 'arc' ? 'перенесены в архив' :
                        ordersForNotification.length === 1 && handlerArgs.newStatus === 'arc' ? 'перенесен в архив' : ordersForNotification.length > 1 && handlerArgs.newStatus === 'canceled' ? 'отменены' : ordersForNotification.length === 1 && handlerArgs.newStatus === 'canceled' ? 'отменен'
                            : ordersForNotification.length > 1 && handlerArgs.newStatus === 'completed' ? 'завершены' : ordersForNotification.length === 1 && handlerArgs.newStatus === 'completed' ? 'завершен' : ''],
                    english: [ordersForNotification.length > 1 ? 'Orders' : 'Order', ordersForNotification.toString(), 'will be automatically', handlerArgs.newStatus === 'arc' ? 'moved to archive' : handlerArgs.newStatus === 'canceled' ? 'canceled' : handlerArgs.newStatus === 'completed' ? 'completed' : '', 'tomorrow']
                }
            )

            await ServerNotification.findOrCreate({
                where: {
                    userInfoId: userInfo.id,
                    message: message,
                    type: handlerArgs.newStatus === 'completed' || handlerArgs.newStatus === 'arc' ? 'success' : handlerArgs.newStatus === 'canceled' ? 'error' : ''
                }
            }).then(async data => {
                if (data[1] === true) {
                    await sendMail(userInfo.email, message, text)
                }
            })
        }
        if (ordersForTypeUpdate.length > 0) {
            message = translateService.setTranslate(
                {
                    russian: [ordersForTypeUpdate.length > 1 ? 'Заказы' : 'Заказ', ordersForTypeUpdate.toString(), 'долго не берут в работу, вы можете преобразовать', ordersForTypeUpdate.length > 1 ? 'их' : 'его', 'в аукцион и рассмотреть предложения перевозчиков'],
                    english: [ordersForTypeUpdate.length > 1 ? 'Orders' : 'Order', ordersForTypeUpdate.toString(), 'is not taken into work for a long time, you can convert', ordersForTypeUpdate.length > 1 ? 'them' : 'it', 'into auction and consider customers offers']
                }
            )
            await ServerNotification.findOrCreate({
                where: {
                    userInfoId: userInfo.id,
                    message: message,
                    type: handlerArgs.newStatus === 'completed' || handlerArgs.newStatus === 'arc' ? 'success' : handlerArgs.newStatus === 'canceled' ? 'error' : ''
                }
            }).then(async data => {
                if (data[1] === true) {
                    await sendMail(userInfo.email, message, text)
                }
            })
        };

        console.log(`${handlerArgs.statusArray.toString()} to ${handlerArgs.newStatus} handling finished!`);
    }
}
