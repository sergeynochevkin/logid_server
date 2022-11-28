const { Order, ServerNotification, Point, UserInfo, User } = require('../models/models')
const { Op } = require("sequelize")
const nodemailer = require('nodemailer');
const e = require('express');

module.exports = async function (handlerArgs) {
    console.log(`${handlerArgs.statusArray.toString()} to ${handlerArgs.newStatus} handling started...`);

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

        for (const element of thisUserOrders) {
            await Point.findAll({ where: { [Op.and]: { orderIntegrationId: element.pointsIntegrationId, sequence: 1 } } }).then(data => { points = data })
            let firstPoint = points.find(el => el.sequence === 1)
            let poinSequences = points.map(el => el.sequence)
            let maxSequence = Math.max(...poinSequences)
            let lastPoint = points.find(el => el.sequence === maxSequence)

            //УВЕДОМЛЕНИЯ!
            //проверка интервала уведомления относительно последнего обновления не новые заказы и не в работе
            if (element.updatedAt < (dateNow - notificationDelay) && element.updatedAt > (dateNow - actionDelay) && !handlerArgs.statusArray.includes('new') && !handlerArgs.statusArray.includes('inWork')) {
                ordersForNotification.push(element.id)
            }
            //проверка интервала уведомления относительно последней точки заказы в работе
            if (lastPoint && lastPoint.time < (dateNow - notificationDelay) && lastPoint.time > (dateNow - actionDelay) && handlerArgs.statusArray.includes('inWork')) {
                ordersForNotification.push(element.id)
            }
            //проверка интервала относительно первой точки новые заказы типа аукцион предложение сменить тип
            if (firstPoint && firstPoint.time < (dateNow - (lastPoint.time - firstPoint.time) * 0.75) && (lastPoint.time > (dateNow - notificationDelay)) && element.order_type === 'order' && handlerArgs.statusArray.includes('new')) {
                ordersForTypeUpdate.push(element.id)
            }
            //проверка интервала уведомления относительно последней точки новые заказы
            if (lastPoint && lastPoint.time < (dateNow - notificationDelay) && lastPoint.time > (dateNow - actionDelay) && handlerArgs.statusArray.includes('new')) {
                ordersForNotification.push(element.id)
            }

            //ОБНОВЛЕНИЯ!
            //проверка интервала относительно времени последнего обновления не заказы в работе и не новые
            if (element.updatedAt < (dateNow - actionDelay) && !handlerArgs.statusArray.includes('inWork') && !handlerArgs.statusArray.includes('new')) {
                ordersForStatusUpdate.push(element.id)
            }
            //проверка интервала относительно времени последнего обновления заказы в работе
            if (lastPoint && lastPoint.time < (dateNow - actionDelay) && (handlerArgs.statusArray.includes('inWork') || handlerArgs.statusArray.includes('new'))) {
                ordersForStatusUpdate.push(element.id)
            }
        };

        let text = 'Это автоматическое уведомление, ответ не будет прочитан'
        let message
        if (ordersForStatusUpdate.length > 0) {
            message = `${ordersForStatusUpdate.length > 1 ? 'Заказы' : 'Заказ'} ${ordersForStatusUpdate.toString()} автоматически ${ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'arc' ? 'перенесены в архив' :
                ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'arc' ? 'перенесен в архив' : ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'canceled' ? 'отменены' : ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'canceled' ? 'отменен'
                    : ordersForStatusUpdate.length > 1 && handlerArgs.newStatus === 'completed' ? 'завершены' : ordersForStatusUpdate.length === 1 && handlerArgs.newStatus === 'completed' ? 'завершен'
                        : ''}`
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
            message = `${ordersForNotification.length > 1 ? 'Заказы' : 'Заказ'} ${ordersForNotification.toString()} завтра ${ordersForNotification.length > 1 ? 'будут' : 'будет'} автоматически ${ordersForNotification.length > 1 && handlerArgs.newStatus === 'arc' ? 'перенесены в архив' :
                ordersForNotification.length === 1 && handlerArgs.newStatus === 'arc' ? 'перенесен в архив' : ordersForNotification.length > 1 && handlerArgs.newStatus === 'canceled' ? 'отменены' : ordersForNotification.length === 1 && handlerArgs.newStatus === 'canceled' ? 'отменен'
                    : ordersForNotification.length > 1 && handlerArgs.newStatus === 'completed' ? 'завершены' : ordersForNotification.length === 1 && handlerArgs.newStatus === 'completed' ? 'завершен'
                        :
                        ''}`
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
            message = `${ordersForTypeUpdate.length > 1 ? 'Заказы' : 'Заказ'} ${ordersForTypeUpdate.toString()} долго не берут в работу, вы можете преобразовать ${ordersForTypeUpdate.length > 1 ? 'их' : 'его'} в аукцион и рассмотреть предложения перевозчиков`
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
