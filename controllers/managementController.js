const { Transport, User, UserInfo, Order, ServerNotification } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op, where } = require("sequelize")
const mail_service = require('../service/mail_service')
const notification_service = require('../service/notification_service')
const translate_service = require('../service/translate_service')
const { v4 } = require('uuid');
const { defaults } = require('pg');
const language_service = require('../service/language_service')

class ManagementController {

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
                let language = language_service.setLanguage(user_info.dataValues.id)


                if (moderated === 'checked_accepted') {

                    let message = translate_service.setNativeTranslate(language, {
                        russian: [`Ваш транспорт ${transport.dataValues.tag} прошел модерацию и допущен к показу на главной странице`],
                        english: [`Your transport ${transport.dataValues.tag} has been moderated and allowed to be displayed on the main page`]
                    })

                    await mail_service.sendUserMail(user_info.dataValues.email,
                        translate_service.setNativeTranslate(language, {
                            russian: [`Ваш транспорт ${transport.dataValues.tag} прошел модерацию`],
                            english: [`Your transport ${transport.dataValues.tag} has been moderated`]
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
                defaults:{uuid:v4()}
                    })
                }
                if (moderated === 'checked_not_accepted') {
                    let message = translate_service.setNativeTranslate(language, {
                        russian: [`Ваш транспорт ${transport.dataValues.tag} прошел модерацию и не допущен к показу на главной странице. Подробности в разделе транспорт`],
                        english: [`Your transport ${transport.dataValues.tag} did not pass moderation and not allowed to be displayed on the main page. Details in the transport section`]
                    })


                    await mail_service.sendUserMail(user_info.dataValues.email,
                        translate_service.setNativeTranslate(language, {
                            russian: [`Ваш транспорт ${transport.dataValues.tag} не прошел модерацию`],
                            english: [`Your transport ${transport.dataValues.tag}  did not pass moderation`]
                        })
                        , message

                    )

                    await ServerNotification.findOrCreate({
                        where: {
                            userInfoId: user_info.dataValues.id,
                            message: message,
                            type: 'error'
                        },
                        defaults:{uuid:v4()}
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