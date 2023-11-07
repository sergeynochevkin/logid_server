const { Transport, User, UserInfo, Order, ServerNotification, Visit, TransportViewed, NotificationState, Subscription, UserAppState, UserAppLimit, LimitCounter, UserAppSetting, Offer } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op, where } = require("sequelize")
const mail_service = require('../service/mail_service')
const notification_service = require('../service/notification_service')
const translate_service = require('../service/translate_service')
const { v4 } = require('uuid');
const { defaults } = require('pg');
const language_service = require('../service/language_service')

class ManagementController {

    async get_clicks(req, res, next) {
        try {
            let resObject = {
                transport_contact: {
                    toDay: '',
                    week: '',
                    month: ''
                }
            }

            let currentTime = new Date()

            let dayStart = currentTime.setHours(0, 0, 0, 0)
            let monthOlder = currentTime - 1000 * 60 * 60 * 24 * 30.5
            let weekOlder = currentTime - 1000 * 60 * 60 * 24 * 7

            let viewsMonth = await TransportViewed.findAll({ where: { [Op.and]: [{ createdAt: { [Op.gt]: monthOlder } }, { contact_viewed: true }] } })
            let viewsWeek = await TransportViewed.findAll({ where: { [Op.and]: [{ createdAt: { [Op.gt]: weekOlder } }, { contact_viewed: true }] } })
            let viewsToDay = await TransportViewed.findAll({ where: { [Op.and]: [{ createdAt: { [Op.gt]: dayStart } }, { contact_viewed: true }] } })

            resObject.transport_contact.month = [...viewsMonth].length
            resObject.transport_contact.week = [...viewsWeek].length
            resObject.transport_contact.toDay = [...viewsToDay].length

            return res.json(resObject)

        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async get_registrations(req, res, next) {
        try {
            let resObject = {
                toDay: '',
                week: '',
                month: ''
            }

            let currentTime = new Date()
            let dayStart = currentTime.setHours(0, 0, 0, 0)
            let monthOlder = currentTime - 1000 * 60 * 60 * 24 * 30.5
            let weekOlder = currentTime - 1000 * 60 * 60 * 24 * 7
            let regsMonth = await User.findAll({ where: { createdAt: { [Op.gt]: monthOlder } } })
            let regsWeek = await User.findAll({ where: { createdAt: { [Op.gt]: weekOlder } } })
            let regsToDay = await User.findAll({ where: { createdAt: { [Op.gt]: dayStart } } })
            resObject.month = [...regsMonth].length
            resObject.week = [...regsWeek].length
            resObject.toDay = [...regsToDay].length
            return res.json(resObject)
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async get_visits(req, res, next) {
        try {
            let resObject = {
                toDay: '',
                week: '',
                month: ''
            }
            let currentTime = new Date()
            let dayStart = currentTime.setHours(0, 0, 0, 0)
            let monthOlder = currentTime - 1000 * 60 * 60 * 24 * 30.5
            let weekOlder = currentTime - 1000 * 60 * 60 * 24 * 7
            await Visit.destroy({ where: { createdAt: { [Op.lt]: monthOlder } } })
            let visitsMonth = await Visit.findAll({ where: { createdAt: { [Op.gt]: monthOlder } } })
            visitsMonth = new Set(visitsMonth.map(el => el.ip))
            let visitsWeek = await Visit.findAll({ where: { createdAt: { [Op.gt]: weekOlder } } })
            visitsWeek = new Set(visitsWeek.map(el => el.ip))
            let visitsToDay = await Visit.findAll({ where: { createdAt: { [Op.gt]: dayStart } } })
            visitsToDay = new Set(visitsToDay.map(el => el.ip))
            resObject.month = [...visitsMonth].length
            resObject.week = [...visitsWeek].length
            resObject.toDay = [...visitsToDay].length

            return res.json(resObject)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async get_users(req, res, next) {

        try {

            let { userId, filters } = req.body
            let users
            let userInfos
            let transports
            users = await User.findAll({ where: { id: { [Op.ne]: userId }, email: { [Op.notIn]: [] }, role: { [Op.in]: filters.users.role !== 'all' && filters.users.role !== '' ? [filters.users.role] : ['carrier', 'customer', 'driver'] }, email: { [Op.substring]: filters.users.searchString.toLowerCase() } } })
            userInfos = await UserInfo.findAll({ where: { userId: { [Op.in]: users.map(el => el.id) }, city: filters.users.city !== 'all' && filters.users.city !== '' ? filters.users.city : { [Op.ne]: '' } } })

            if (filters.users.city !== 'all' && filters.users.city !== '') {
                users = users.filter(el => userInfos.map(el => el.userId).includes(el.id))
            }

            if (filters.users.delivery_group !== 'all' && filters.users.delivery_group !== '' && filters.users.role === 'carrier') {
                let group
                group = filters.users.delivery_group === 'for_courier_delivery' ? ['walk', 'bike', 'car', 'scooter', 'electric_scooter'] : ['truck', 'minibus', 'combi']
                transports = await Transport.findAll({ where: { userInfoId: { [Op.in]: userInfos.map(el => el.id) }, type: { [Op.in]: group } } })
                userInfos = userInfos.filter(el => transports.map(el => el.userInfoId).includes(el.id))
                users = users.filter(el => userInfos.map(el => el.userId).includes(el.id))
            }
            else {
                transports = await Transport.findAll({ where: { userInfoId: { [Op.in]: userInfos.map(el => el.id) } } })
            }

            //clear that i dont need
            let handledUsers = []
            for (const user of users) {
                let userPattern = {
                    id: undefined,
                    email: '',
                    role: '',
                    created_at: '',
                    //maybe more
                    user_info: {},
                    transports: [],
                }
                //add what i need
                userPattern.id = user.id
                userPattern.email = user.email
                userPattern.role = user.role
                userPattern.created_at = user.created_at
                let userInfo = { ...userInfos.find(el => el.userId === user.id) }
                userPattern.user_info = { ...userInfo.dataValues }

                if (user.role === 'carrier' && transports) {
                    let userInfoId = userPattern.user_info.id
                    userPattern.transports = [...transports.filter(el => el.userInfoId === userInfoId)]
                }
                handledUsers.push(userPattern)
            }
            return res.json(handledUsers)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async get_orders(req, res, next) {
        try {
            let orders = await Order.findAll({})
            return res.json(orders)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async get_transports(req, res, next) {
        try {
            let transports = await Transport.findAll({})
            return res.json(transports)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async send_notification(req, res, next) {
        try {
            let { formData } = req.body

            let { members, subject, message, type } = formData
            let users = await User.findAll({ where: { id: { [Op.in]: members } } })
            for (const user of users) {
                let userInfo = await UserInfo.findOne({ where: { userId: user.id } })
                if (type === 'mail') {
                    await mail_service.sendManagementEmail(subject, message, userInfo ? userInfo.dataValues.email : user.email, user.id, userInfo ? userInfo.dataValues.id : null)
                }
                if (type === 'alert') {
                    await notification_service.addManagementNotification(subject, message, members)
                }
                if (type === 'mail_alert') {
                    await mail_service.sendManagementEmail(subject, message, members)
                    await mail_service.sendManagementEmail(subject, message, userInfo ? userInfo.dataValues.email : user.email, user.id, userInfo ? userInfo.dataValues.id : null)
                    await notification_service.addManagementNotification(subject, message, members)
                }
            }

            return res.send('notification_sent')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async updateField(req, res, next) {
        try {
            let { formData } = req.body

            let {
                id,
                option,
                moderated,
                moderation_comment
            } = formData

            if (option === 'transport') {
                await Transport.update({ moderated, moderation_comment }, { where: { id } })
                let transport = await Transport.findOne({ where: { id } })
                let user_info = await UserInfo.findOne({ where: { id: transport.dataValues.userInfoId } })
                let language = await language_service.setLanguage(user_info.dataValues.id)

                if (moderated === 'checked_accepted') {
                    let message = translate_service.setNativeTranslate(language, {
                        russian: [`Ваш транспорт ${transport.dataValues.tag} прошел модерацию и допущен к показу на главной странице`],
                        english: [`Your transport ${transport.dataValues.tag} has been moderated and allowed to be displayed on the main page`],
                        spanish: [`Tu transporte ${transport.dataValues.tag} ha sido moderado y se le ha permitido mostrarse en la página principale`],
                        turkish: [`Nakliyeniz ${transport.dataValues.tag} denetlendi ve ana sayfada görüntülenmesine izin verildi`],
                        chinese: [`您的交通工具 ${transport.dataValues.tag} 已被审核并允许在主页上显示`],
                        hindi: [`आपका परिवहन ${transport.dataValues.tag} मॉडरेट किया गया है और मुख्य पृष्ठ पर प्रदर्शित करने की अनुमति दी गई है`],
                    })

                    await mail_service.sendUserMail(user_info.dataValues.email,
                        translate_service.setNativeTranslate(language, {
                            russian: [`Ваш транспорт ${transport.dataValues.tag} прошел модерацию`],
                            english: [`Your transport ${transport.dataValues.tag} has been moderated`],
                            spanish: [`Tu transporte ${transport.dataValues.tag} ha sido moderado`],
                            turkish: [`Nakliyeniz ${transport.dataValues.tag} denetlendi`],
                            chinese: [`您的交通工具 ${transport.dataValues.tag} 已被审核`],
                            hindi: [`आपका परिवहन ${transport.dataValues.tag} मॉडरेट किया गया है`],
                        })
                        , message
                    )

                    await ServerNotification.findOrCreate({
                        where: {
                            userInfoId: user_info.dataValues.id,
                            message: message,
                            type: 'success'
                        }
                        ,
                        defaults: { uuid: v4() }
                    })
                }

                if (moderated === 'checked_not_accepted') {
                    let message = translate_service.setNativeTranslate(language, {
                        russian: [`Ваш транспорт ${transport.dataValues.tag} не прошел модерацию и не допущен к показу на главной странице. Подробности в разделе транспорт`],
                        english: [`Your transport ${transport.dataValues.tag} did not pass moderation and not allowed to be displayed on the main page. Details in the transport section`],
                        spanish: [`Tu transporte ${transport.dataValues.tag} no pasó la moderación y no se le permitió mostrarse en la página principal. Detalles en la sección de transporte`],
                        turkish: [`Nakliyeniz ${transport.dataValues.tag} denetimi geçemedi ve ana sayfada görüntülenmesine izin verilmedi. Detaylar ulaşım bölümünde`],
                        chinese: [`您的交通工具 ${transport.dataValues.tag} 未通过审核，不允许在首页展示。 运输部分的详细信息`],
                        hindi: [`आपका परिवहन ${transport.dataValues.tag} मॉडरेशन पास नहीं किया और मुख्य पृष्ठ पर प्रदर्शित होने की अनुमति नहीं दी। परिवहन अनुभाग में विवरण`],
                    })

                    await mail_service.sendUserMail(user_info.dataValues.email,
                        translate_service.setNativeTranslate(language, {
                            russian: [`Ваш транспорт ${transport.dataValues.tag} не прошел модерацию`],
                            english: [`Your transport ${transport.dataValues.tag}  did not pass moderation`],
                            spanish: [`Tu transporte ${transport.dataValues.tag} no pasó la moderación`],
                            turkish: [`Nakliyeniz ${transport.dataValues.tag} denetimi geçemedi`],
                            chinese: [`您的交通工具 ${transport.dataValues.tag} 没有通过审核`],
                            hindi: [`आपका परिवहन ${transport.dataValues.tag} संयम पारित नहीं किया`],
                        })
                        , message
                    )

                    await ServerNotification.findOrCreate({
                        where: {
                            userInfoId: user_info.dataValues.id,
                            message: message,
                            type: 'error'
                        },
                        defaults: { uuid: v4() }
                    })
                }
                return res.send(moderated === 'checked_accepted' ? `Transport ${id} moderated` : `Transport ${id} not moderated`)
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    // now only new user! later what to do with offers, orders, transports 
    async user_destroy(req, res, next) {
        try {
            let { id } = req.query // use different cases and different messages
            let user = await User.findOne({ where: { id } })
            let language
            let email = user.email
            let userInfoId
            let userInfo =await UserInfo.findOne({ where: { userId: id } })
            if (userInfo) {
                userInfoId = userInfo.id
                let orders = await Order.findAll({ where: { userInfoId } })
                let transports = await Transport.findAll({ where: { userInfoId } })
                let offers = await Offer.findAll({ where: { userInfoId } })
                let drivers = await User.findAll({ where: { user_id: id } })
                if (orders.length>0 || transports.length>0 || offers.length>0 || drivers.length>0) {
                    throw ApiError.badRequest(translate_service.setNativeTranslate('english',                        {
                            russian: ['Не удалось удалить пользователя у него есть', orders.length>0 ? 'заказы' : '', offers.length>0 ? 'предложения' : '', transports.length>0 ? 'транспорт' : '', drivers.length>0 ? 'водители' : ''],
                            english: ['Failed to delete the user he has', orders.length>0 ? 'orders' : '', offers.length>0 ? 'offers' : '', transports.length>0 ? 'transports' : '', drivers.length>0 ? 'drivers' : ''],
                        }
                    ))
                }
                language = await language_service.setLanguage(userInfoId, '')
                await NotificationState.destroy({ where: { userInfoId: userInfo.id } })
                await Subscription.destroy({ where: { userInfoId } })
                await UserAppState.destroy({ where: { userInfoId } })
                await UserAppLimit.destroy({ where: { userInfoId } })
                await LimitCounter.destroy({ where: { userInfoId } })
                await UserAppSetting.destroy({ where: { userInfoId } })
                await UserInfo.destroy({ where: { userId: id } })
            } else {
                language = await language_service.setLanguage('', id)
            }

            await User.destroy({ where: { id } })
            await mail_service.sendUserMail(email,
                translate_service.setNativeTranslate(language, {
                    russian: ['Ваш аккаунт logid удален'],
                    english: ['Your logid account has been deleted'],
                    spanish: ['Su cuenta de inicio de sesión ha sido eliminada'],
                    turkish: ['Logid hesabınız silindi'],
                    chinese: ['您的logid帐户已被删除'],
                    hindi: ['आपका लॉग इन खाता हटा दिया गया है'],
                })
                ,
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Это автоматическое уведомление, ответ не будет прочитан'],
                        english: ['This is an automatic notification, the response will not be read'],
                        spanish: ['Esta es una notificación automática, la respuesta no será leída'],
                        turkish: ['Bu otomatik bir bildirimdir, yanıt okunmayacaktır'],
                        chinese: ['这是自动通知，回复不会被阅读'],
                        hindi: ['यह एक स्वचालित अधिसूचना है, उत्तर पढ़ा नहीं जाएगा'],
                    })
            )
            return res.send('deleted')
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }
}

module.exports = new ManagementController()