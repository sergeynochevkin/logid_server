const { Transport, User, UserInfo, Order, ServerNotification, Visit } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op, where } = require("sequelize")
const mail_service = require('../service/mail_service')
const notification_service = require('../service/notification_service')
const translate_service = require('../service/translate_service')
const { v4 } = require('uuid');
const { defaults } = require('pg');
const language_service = require('../service/language_service')

class ManagementController {

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

            let { userId } = req.query
            let users = await User.findAll({ where: { id: { [Op.ne]: userId }, email: { [Op.notIn]: [] } } })
            let userInfos = await UserInfo.findAll({})
            let transports = await Transport.findAll({})

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
}

module.exports = new ManagementController()