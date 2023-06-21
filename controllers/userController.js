const jwt = require('jsonwebtoken')
const userService = require('../service/user_service')
const translateService = require('../service/translate_service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api_error')
const { User, ServerNotification, Translation, UserInfo, Transport, NotificationState, Subscription, UserAppState, UserAppLimit, LimitCounter, UserAppSetting, SubscriptionOption, SubscriptionOptionsByPlan } = require('../models/models')
const time_service = require('../service/time_service')
const { Op } = require('sequelize')


class UserController {


    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(translateService.setNativeTranslate('english',
                    {
                        russian: ['Ошибка валидации'],
                        english: ['Validation error']
                    }
                ), errors.array()))//at last
            }
            const { email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted } = req.body
            const userData = await userService.registration(email.toLowerCase(), password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async fast_registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(translateService.setNativeTranslate('english',
                    {
                        russian: ['Ошибка валидации'],
                        english: ['Validation error']
                    }
                ), errors.array()))//at last
            }
            const {
                language,
                phone,
                email,
                password,
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
                type
            } = req.body


            let userData = await userService.registration(email.toLowerCase(), password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted)
            const user_info = await UserInfo.create({ userId: userData.user.id, city, city_place_id, city_latitude, city_longitude, country, email, phone })

            //defaults copy from userinfo controller
            let initialTime = new Date();
            initialTime.setHours(23, 59, 59, 0)
            let paid_to = time_service.setTime(initialTime, 1440 * 365, 'form')

            await NotificationState.create({ userInfoId: user_info.id })
            await Subscription.create({ userInfoId: user_info.id, planId: 6, country: user_info.country, paid_to })
            await UserAppState.create({ userInfoId: user_info.id })
            await UserAppLimit.create({ userInfoId: user_info.id })
            await LimitCounter.create({ userInfoId: user_info.id })

            let currentTime = new Date()
            let optionsByPlan = await SubscriptionOptionsByPlan.findAll({ where: { planId: 6 } })
            optionsByPlan = optionsByPlan.map(el => el.optionId)
            let options = await SubscriptionOption.findAll({ where: { option_id: { [Op.in]: optionsByPlan }, country: user_info.country } })

            if (userData.user.role === 'carrier') {
                let carrier_offer_limit_per_day = options.find(el => el.role === 'carrier' && el.type === 'offer')
                carrier_offer_limit_per_day = carrier_offer_limit_per_day.limit
                let carrier_take_order_limit_per_day = options.find(el => el.role === 'carrier' && el.type === 'take_order')
                carrier_take_order_limit_per_day = carrier_take_order_limit_per_day.limit
                let carrier_take_order_city_limit = options.find(el => el.role === 'carrier' && el.type === 'order_range')
                carrier_take_order_city_limit = carrier_take_order_city_limit.limit
                await UserAppLimit.update({ carrier_offer_limit_per_day, carrier_take_order_limit_per_day, carrier_take_order_city_limit }, { where: { userInfoId: user_info.id } })
                await LimitCounter.update({ carrier_offer_amount_per_day: 0, carrier_take_order_amount_per_day: 0, carrier_take_order_started: currentTime, carrier_offer_started: currentTime }, { where: { userInfoId: user_info.id } })
            }
            if (userData.user.role === 'customer') {
                let customer_create_order_limit_per_day = options.find(el => el.role === 'customer' && el.type === 'order')
                customer_create_order_limit_per_day = customer_create_order_limit_per_day.limit
                let customer_new_order_range = options.find(el => el.role === 'customer' && el.type === 'order_range')
                customer_new_order_range = customer_new_order_range.limit
                let customer_new_order_point_limit = options.find(el => el.role === 'customer' && el.type === 'point_limit')
                customer_new_order_point_limit = customer_new_order_point_limit.limit
                await UserAppLimit.update({ customer_create_order_limit_per_day, customer_new_order_range, customer_new_order_point_limit }, { where: { userInfoId: user_info.id } })
                await LimitCounter.update({ customer_create_amount_per_day: 0, customer_create_started: currentTime }, { where: { userInfoId: user_info.id } })
            }

            let userAppSettingsDefaultList = [
                { name: 'sms_messaging', value: true, role: 'both' },
                { name: 'email_messaging', value: true, role: 'both' }
            ]

            userAppSettingsDefaultList = userAppSettingsDefaultList.filter(el => el.role === role || el.role === 'both')

            for (const setting of userAppSettingsDefaultList) {
                await UserAppSetting.findOrCreate({
                    where: {
                        name: setting.name, value: setting.value, userInfoId: user_info.id
                    }
                }
                )
            }
            //defaults the end

            if (role === 'carrier') {
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
            const { email, password, language } = req.body
            const userData = await userService.login(email.toLowerCase(), password, language)
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
                    english: ['A new account activation link has been sent to', email]
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


