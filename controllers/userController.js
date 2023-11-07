const jwt = require('jsonwebtoken')
const userService = require('../service/user_service')
const translateService = require('../service/translate_service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api_error')
const { User, ServerNotification, Translation, UserInfo, Transport, NotificationState, Subscription, UserAppState, UserAppLimit, LimitCounter, UserAppSetting, SubscriptionOption, SubscriptionOptionsByPlan, Order, Offer } = require('../models/models')
const time_service = require('../service/time_service')
const { Op } = require('sequelize')
const limit_service = require('../service/limit_service')
const { v4 } = require('uuid');
const generator = require('generate-password');
const mail_service = require('../service/mail_service')
const language_service = require('../service/language_service');


class UserController {

    //driver
    async driver_registration(req, res, next) {
        try {
            let {
                language,
                email,
                role,
                phone,

                user_id,
                user_info_uuid,

                country,
                legal,
                city,
                city_place_id,
                city_latitude,
                city_longitude,

                name_surname_fathersname
            } = req.body

            let password = generator.generate({
                length: 18,
                numbers: true,
                symbols: true,
                uppercase: true,
                lowercase: true,
                excludeSimilarCharacters: true
            });

            let userInfo = await UserInfo.findOne({ where: { uuid: user_info_uuid } })
            await limit_service.check_account_activated(language, userInfo.id)

            let userData = await userService.registration(user_id, user_info_uuid, email.toLowerCase(), password, role, language, country)
            const user_info = await UserInfo.create({ userId: userData.user.id, city, city_place_id, city_latitude, city_longitude, country, email, phone, uuid: v4(), legal, name_surname_fathersname })

            await NotificationState.create({ userInfoId: user_info.id })
            // await Subscription.create({ userInfoId: user_info.id, planId: 6, country: user_info.country, paid_to })
            await UserAppState.create({ userInfoId: user_info.id })
            await UserAppLimit.create({ userInfoId: user_info.id })
            await LimitCounter.create({ userInfoId: user_info.id })

            let userAppSettingsDefaultList = [
                { name: 'sms_messaging', value: country === 'russia' ? false : false, role: 'both', managing_by: 'user' },
                { name: 'email_messaging', value: true, role: 'both', managing_by: 'user' },
                { name: 'can_see_new_orders', value: true, role: 'driver', managing_by: 'supervisor' },
                { name: 'can_take_order', value: true, role: 'driver', managing_by: 'supervisor' },
                { name: 'can_make_offer', value: false, role: 'driver', managing_by: 'supervisor' },
                { name: 'can_finish_order', value: true, role: 'driver', managing_by: 'supervisor' },
                { name: 'can_set_order_as_disrupted', value: false, role: 'driver', managing_by: 'supervisor' }
            ]

            userAppSettingsDefaultList = userAppSettingsDefaultList.filter(el => el.role === role || el.role === 'both')

            for (const setting of userAppSettingsDefaultList) {
                await UserAppSetting.findOrCreate({
                    where: {
                        name: setting.name, value: setting.value, userInfoId: user_info.id, managing_by: setting.managing_by
                    }
                }
                )
            }
            return res.send('added')

        } catch (e) {
            next(e)
        }
    }

    async get_drivers(req, res, next) {
        try {
            let { userId } = req.query
            let drivers
            let user = await User.findOne({ where: { id: userId }, include: UserInfo })



            if (user.role === 'carrier') {
                drivers = await User.findAll({
                    where: { user_id: userId }, attributes: ['email', 'id', 'role', 'isActivated'], include: {
                        model: UserInfo,
                        include: UserAppSetting
                    }
                })


            }
            if (user.role === 'customer') {
                let orders = []
                orders = await Order.findAll({
                    where: { order_status: ['inWork', 'completed'], userInfoId: user.user_info.id }
                })

                let driverUserInfoIds = orders.map(el => el.driver_id)
                let driverUsers = await UserInfo.findAll({ where: { id: { [Op.in]: driverUserInfoIds } }, include: User })
                let driverUserIds = driverUsers.map(el => el.user).map(el => el.id)
                drivers = await User.findAll({
                    where: { id: { [Op.in]: driverUserIds } }, attributes: ['email', 'id', 'role', 'isActivated'], include: {
                        model: UserInfo,
                    }
                })
            }

            return res.json(drivers)
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async activate_driver(req, res, next) {
        try {
            let { id, language } = req.body
            await User.update({ isActivated: true }, { where: { id } })
            return res.send(translateService.setNativeTranslate(language, {
                russian: ['Вы активировали аккаунт'],
                english: ['You have activated your account'],
                spanish: ['Has activado tu cuenta'],
                turkish: ['Hesabınızı etkinleştirdiniz'],
                chinese: ['您已激活您的帐户'],
                hindi: ['आपने अपना खाता सक्रिय कर लिया है'],
            }))

        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async delete_driver(req, res, next) {
        try {

        } catch (e) {

        }
    }
    //driver

    //not in use
    // async registration(req, res, next) {
    //     try {
    //         const errors = validationResult(req)
    //         if (!errors.isEmpty()) {
    //             return next(ApiError.badRequest(translateService.setNativeTranslate('english',
    //                 {
    //                     russian: ['Ошибка валидации'],
    //                     english: ['Validation error']
    //                 }
    //             ), errors.array()))//at last
    //         }
    //         const { email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted } = req.body
    //         const userData = await userService.registration(email.toLowerCase(), password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted)
    //         res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
    //         return res.json(userData)
    //     } catch (e) {
    //         next(e);
    //     }
    // }
    //not in use


    async fast_registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(translateService.setNativeTranslate('english',
                    {
                        russian: ['Ошибка валидации'],
                        english: ['Validation error'],
                        spanish: ['Error de validacion'],
                        turkish: ['Doğrulama hatası'],
                        chinese: ['验证错误'],
                        hindi: ['मान्यता त्रुटि'],
                    }
                ), errors.array()))//at last
            }
            const {
                language,
                phone,
                email,

                role,
                country,
                user_agreement_accepted,
                privacy_policy_accepted,
                age_accepted,
                personal_data_agreement_accepted,
                cookies_accepted,
                city,
                city_place_id,
                city_latitude,
                city_longitude,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                tag,
                load_capacity,
                side_type,
                type,
                from_fast,
                promo_code
            } = req.body

            if (role === 'admin') {
                return res.send('Sorry we already have admin!')
            }

            let password = generator.generate({
                length: 18,
                numbers: true,
                symbols: true,
                uppercase: true,
                lowercase: true,
                excludeSimilarCharacters: true
            });


            let userData = await userService.registration(null, null, email.toLowerCase(), password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted)
            const user_info = await UserInfo.create({ userId: userData.user.id, city, city_place_id, city_latitude, city_longitude, country, email, phone, uuid: v4() })

            //defaults copy from userinfo controller
            let initialTime = new Date();
            initialTime.setHours(23, 59, 59, 0)
            let paid_to = time_service.setTime(initialTime, 1440 * 365, 'form')
            let plan_id = 1

            await NotificationState.create({ userInfoId: user_info.id })
            await Subscription.create({ userInfoId: user_info.id, planId: plan_id, country: user_info.country, paid_to })// plan by promocodes && validity date promocode from link or from form!
            await UserAppState.create({ userInfoId: user_info.id })
            await UserAppLimit.create({ userInfoId: user_info.id })
            await LimitCounter.create({ userInfoId: user_info.id })

            await limit_service.setSubscriptionLimits(plan_id, user_info)

            let userAppSettingsDefaultList = [
                { name: 'sms_messaging', value: country === 'russia' ? true : false, role: 'both', managing_by: 'user' },
                { name: 'email_messaging', value: true, role: 'both', managing_by: 'user' }
            ]

            userAppSettingsDefaultList = userAppSettingsDefaultList.filter(el => el.role === role || el.role === 'both')

            for (const setting of userAppSettingsDefaultList) {
                await UserAppSetting.findOrCreate({
                    where: {
                        name: setting.name, value: setting.value, userInfoId: user_info.id, managing_by: setting.managing_by
                    }
                }
                )
            }
            //defaults the end

            if (role === 'carrier' && type) {
                const transport = await Transport.create({
                    userInfoId: user_info.id,
                    thermo_bag,
                    hydraulic_platform,
                    side_loading,
                    glass_stand,
                    refrigerator_minus,
                    refrigerator_plus,
                    thermo_van,
                    tag,
                    type,
                    load_capacity,
                    side_type,
                    from_fast,
                    driver_id: user_info.id,
                })
            }

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            let { userId, email, password, language } = req.body
            const userData = await userService.update(userId, email.toLowerCase(), password, language)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async restore(req, res, next) {
        try {
            let { password, code, language } = req.body
            const userData = await userService.restore(password, code, language)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async getCode(req, res, next) {
        try {
            let { email, language } = req.query
            await userService.password_update_code(email.toLowerCase(), language)
            return res.send('code send')
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password, language, user_agreement_accepted,
                privacy_policy_accepted,
                age_accepted,
                personal_data_agreement_accepted,
                cookies_accepted } = req.body
            const userData = await userService.login(email.toLowerCase(), password, language, user_agreement_accepted,
                privacy_policy_accepted,
                age_accepted,
                personal_data_agreement_accepted,
                cookies_accepted.total)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            const language = req.query.language
            let uuid = await userService.activate(activationLink, language)
            return res.redirect(`${process.env.CLIENT_URL}/?uuid=${uuid}`)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async restore_link(req, res, next) {
        let { email, language } = req.query
        try {
            userService.generate_link(email.toLowerCase(), language)
            return res.send(translateService.setNativeTranslate(language,
                {
                    russian: ['Новая ссылка для активации аккаунта отправлена на', email],
                    english: ['A new account activation link has been sent to', email],
                    spanish: ['Se ha enviado un enlace de activación de cuenta nueva a', email],
                    turkish: ['Yeni bir hesap aktivasyon bağlantısı şu adrese gönderildi:', email],
                    chinese: ['新帐户激活链接已发送至', email],
                    hindi: ['एक नया खाता सक्रियण लिंक भेज दिया गया है', email],
                }
            ))
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async getOne(req, res, next) {
        try {
            let { userId } = req.query
            let user;
            user = await User.findOne({ where: { id: userId } })
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new UserController()


