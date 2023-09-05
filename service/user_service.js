const { User, ServerNotification, UserInfo, NotificationState, Subscription, UserAppState, UserAppLimit, LimitCounter, UserAppSetting, SubscriptionOption, SubscriptionOptionsByPlan } = require('../models/models')
const bcrypt = require('bcrypt')
const { v4 } = require('uuid');
const mailService = require('./mail_service')
const tokenService = require('./token_service');
const UserDTO = require('../dtos/user_dto');
const ApiError = require('../exceptions/api_error');
const translateService = require('../service/translate_service')
const time_service = require('../service/time_service')
const { Op } = require("sequelize")

class UserService {

    async registration(email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted) {
        if (!email || !password) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Не корректный email или пароль'],
                    english: ['Incorrect email or password']
                }
            ))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['email уже занят'],
                    english: ['email is already taken']
                }
            ))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const activationLink = v4()
        const user = await User.create({ email, password: hashPassword, role, activationLink, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted })
        if (role !== 'driver') {
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}?language=${language}`, language)
        } else {
            //send letter with email and password
            await mailService.sendCredentialsEmail(email, `${process.env.CLIENT_URL}?language=${language}&&action=driver_activation`, password, role, language)
        }
        await mailService.sendEmailToAdmin(`New ${role} registered at ${process.env.CLIENT_URL}`, 'App notification')

        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }

    async registration_presets(user_info, userData) {

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
    }

    async update(userId, email, password, language) {
        if (!email && password) {
            const candidate = await User.findOne({ where: { id: userId } })
            let comparePassword = bcrypt.compareSync(password, candidate.password)
            if (comparePassword) {
                throw ApiError.badRequest(translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы ввели действующий пароль'],
                        english: ['You have entered your current password']
                    }
                ))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            await User.update({ password: hashPassword }, { where: { id: userId } })
            const user = await User.findOne({ where: { id: userId } })
            const userDto = new UserDTO(user)
            const tokens = await tokenService.generateTokens({ ...userDto })
            await tokenService.saveToken(userDto.id, tokens.refreshToken)
            return {
                ...tokens,
                user: userDto
            }
        }
        if (email && !password) {
            const candidate = await User.findOne({ where: { email } })
            if (candidate) {
                if (candidate.id === userId) {
                    throw ApiError.badRequest(translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы ввели действующий email'],
                            english: ['You have entered your current email']
                        }
                    ))
                }
                else {
                    throw ApiError.badRequest(translateService.setNativeTranslate(language,
                        {
                            russian: ['email уже занят'],
                            english: ['email is already taken']
                        }
                    ))
                }
            }
            const activationLink = v4()
            await User.update({ email, activationLink, isActivated: false }, { where: { id: userId } })
            const user = await User.findOne({ where: { id: userId } })
            await mailService.sendActivationMail(email, `${process.env.API_URL} / api / user / activate / ${activationLink} ? language = ${language}`, language)
            const userDto = new UserDTO(user)
            const tokens = await tokenService.generateTokens({ ...userDto })
            await tokenService.saveToken(userDto.id, tokens.refreshToken)
            return {
                ...tokens,
                user: userDto
            }
        }
    }

    async generate_link(email, language) {
        const activationLink = v4()
        await User.update({ activationLink }, { where: { email } })
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}?language=${language}`, language)
        return null
    }

    async restore(password, code, language) {
        const candidate = await User.findOne({ where: { emailRecoveryCode: code } })
        if (!candidate) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Неверный код подтверждения'],
                    english: ['Incorrect confirmation code']
                }
            ))
        } else {
            let comparePassword = bcrypt.compareSync(password, candidate.password)
            if (comparePassword) {
                throw ApiError.badRequest(translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы ввели действующий пароль'],
                        english: ['You have entered your current password']
                    }
                ))
            }
        }
        const hashPassword = await bcrypt.hash(password, 5)
        await User.update({ password: hashPassword }, { where: { emailRecoveryCode: code } })
        const user = await User.findOne({ where: { emailRecoveryCode: code } })
        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }

    async password_update_code(email, language) {
        const candidate = await User.findOne({ where: { email } })
        if (!candidate) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Вы ввели не корректный email'],
                    english: ['You entered an incorrect email']
                }
            ))
        }
        const emailRecoveryCode = v4()
        await User.update({ emailRecoveryCode }, { where: { email } })
        await mailService.sendEmailRecoveryCode(email, `${emailRecoveryCode}`, language)
    }

    //no lang!
    async activate(activationLink, language) {
        let uuid = activationLink
        const user = await User.findOne({ where: { activationLink } })
        if (!user) {
            await ServerNotification.create({
                message: translateService.setNativeTranslate(language,
                    {
                        russian: ['Неверная ссылка активации'],
                        english: ['Incorrect activation link']
                    }
                ), type: 'error', uuid: activationLink
            })
        } else {
            const userInfo = await UserInfo.findOne({ where: { userId: user.id } })
            if (user.isActivated) {
                await ServerNotification.create({
                    message: translateService.setNativeTranslate(language,
                        {
                            russian: ['Аккаунт уже активирован'],
                            english: ['Account has already been activated']
                        }
                    ), type: 'error', uuid: activationLink
                })
            } else {
                await User.update({ isActivated: true }, { where: { id: user.id } })
                await ServerNotification.create({
                    userInfoId: userInfo.id, message: translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы активировали аккаунт'],
                            english: ['You have activated your account']
                        }
                    ), type: 'success', uuid: activationLink
                })
            }
        }
        return uuid
    }

    async login(email, password, language) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Пользователя с таким email не существует'],
                    english: ['User with this email does not exist']
                }
            ))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Нееверный пароль'],
                    english: ['Incorrect password']
                }
            ))
        }
        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return (token)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.unauthorizedError()
        }
        const userData = await tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.unauthorizedError()
        }
        const user = await User.findOne({ where: { id: userData.id } })
        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }
}

module.exports = new UserService()