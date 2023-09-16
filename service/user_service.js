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

    async registration(user_id, user_info_uuid, email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted) {
        if (!email || !password) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Не корректный email или пароль'],
                    english: ['Incorrect email or password'],
                    spanish: ['Correo o contraseña incorrectos'],
                    turkish: ['Yanlış eposta adresi veya şifre'],
                    chinese: ['错误的邮箱帐号或密码'],
                    hindi: ['गलत ईमेल या पासवर्ड'],
                
                }
            ))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['email уже занят'],
                    english: ['email is already taken'],
                    spanish: ['el correo electronico ya ha sido tomado'],
                    turkish: ['e-posta zaten alınmış'],
                    chinese: ['ईमेल पहले से ही लिया जा चुका है'],
                    hindi: ['电子邮件已经被采取'],
                
                }
            ))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const activationLink = v4()
        const user = await User.create({ user_id, user_info_uuid, email, password: hashPassword, role, activationLink, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted, personal_data_agreement_accepted })
        if (role !== 'driver') {
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}?language=${language}`, language)
        } else {
            //send letter with email and password
            await mailService.sendCredentialsEmail(email, `${process.env.CLIENT_URL}?action=driver_activation`, password, role, language)
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
                        english: ['You have entered your current password'],
                        spanish: ['Has introducido tu contraseña actual'],
                        turkish: ['Mevcut şifrenizi girdiniz'],
                        chinese: ['您已输入当前密码'],
                        hindi: ['आपने अपना वर्तमान पासवर्ड दर्ज कर दिया है'],
                    
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
                            english: ['You have entered your current email'],
                            spanish: ['Has introducido tu correo electrónico actual'],
                            turkish: ['Mevcut e-postanızı girdiniz'],
                            chinese: ['您已输入当前的电子邮件'],
                            hindi: ['आपने अपना वर्तमान ईमेल दर्ज कर दिया है'],
                        
                        }
                    ))
                }
                else {
                    throw ApiError.badRequest(translateService.setNativeTranslate(language,
                        {
                            russian: ['email уже занят'],
                            english: ['email is already taken'],
                            spanish: ['el correo electronico ya ha sido tomado'],
                            turkish: ['e-posta zaten alınmış'],
                            chinese: ['电子邮件已经被采取'],
                            hindi: ['ईमेल पहले से ही लिया जा चुका है'],
                        
                        }
                    ))
                }
            }
            const activationLink = v4()
            await User.update({ email, activationLink, isActivated: false }, { where: { id: userId } })
            const user = await User.findOne({ where: { id: userId } })
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}?language=${language}`, language)
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
                    english: ['Incorrect confirmation code'],
                    spanish: ['Código de confirmación incorrecto'],
                    turkish: ['Yanlış onay kodu'],
                    chinese: ['确认码不正确'],
                    hindi: ['ग़लत पुष्टिकरण कोड'],
                
                }
            ))
        } else {
            let comparePassword = bcrypt.compareSync(password, candidate.password)
            if (comparePassword) {
                throw ApiError.badRequest(translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы ввели действующий пароль'],
                        english: ['You have entered your current password'],
                        spanish: ['Has introducido tu contraseña actual'],
                        turkish: ['Mevcut şifrenizi girdiniz'],
                        chinese: ['您已输入当前密码'],
                        hindi: ['आपने अपना वर्तमान पासवर्ड दर्ज कर दिया है'],
                    
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
                    english: ['You entered an incorrect email'],
                    spanish: ['Ingresaste un correo electrónico incorrecto'],
                    turkish: ['Yanlış bir e-posta girdiniz'],
                    chinese: ['您输入的电子邮件不正确'],
                    hindi: ['आपने ग़लत ईमेल दर्ज किया है'],
                
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
                        english: ['Incorrect activation link'],
                        spanish: ['Enlace de activación incorrecto'],
                        turkish: ['Yanlış etkinleştirme bağlantısı'],
                        chinese: ['激活链接不正确'],
                        hindi: ['ग़लत सक्रियण लिंक'],
                    
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
                            english: ['Account has already been activated'],
                            spanish: ['La cuenta ya ha sido activada'],
                            turkish: ['Hesap zaten etkinleştirildi'],
                            chinese: ['账户已经激活'],
                            hindi: ['खाता पहले ही सक्रिय हो चुका है'],
                        
                        }
                    ), type: 'error', uuid: activationLink
                })
            } else {
                await User.update({ isActivated: true }, { where: { id: user.id } })
                await ServerNotification.create({
                    userInfoId: userInfo.id, message: translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы активировали аккаунт'],
                            english: ['You have activated your account'],
                            spanish: ['Has activado tu cuenta'],
                            turkish: ['Hesabınızı etkinleştirdiniz'],
                            chinese: ['您已激活您的帐户'],
                            hindi: ['आपने अपना खाता सक्रिय कर लिया है'],
                        
                        }
                    ), type: 'success', uuid: activationLink
                })
            }
        }
        return uuid
    }

    async login(email, password, language, user_agreement_accepted,
        privacy_policy_accepted,
        age_accepted,
        personal_data_agreement_accepted,
        cookies_accepted) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Пользователя с таким email не существует'],
                    english: ['User with this email does not exist'],
                    spanish: ['El usuario con este correo electrónico no existe'],
                    turkish: ['Bu e-postaya sahip kullanıcı mevcut değil'],
                    chinese: ['使用此电子邮件的用户不存在'],
                    hindi: ['इस ईमेल वाला उपयोगकर्ता मौजूद नहीं है'],
                
                }
            ))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Нееверный пароль'],
                    english: ['Incorrect password'],
                    spanish: ['Contraseña incorrecta'],
                    turkish: ['Yanlış parola'],
                    chinese: ['密码错误'],
                    hindi: ['गलत पासवर्ड'],
                
                }
            ))
        }
        if (user_agreement_accepted &&
            privacy_policy_accepted &&
            age_accepted &&
            personal_data_agreement_accepted &&
            cookies_accepted) {
            await user.update({
                user_agreement_accepted,
                privacy_policy_accepted,
                age_accepted,
                personal_data_agreement_accepted,
                cookies_accepted
            }, { where: { email } })
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