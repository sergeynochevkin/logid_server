const { User, ServerNotification, UserInfo } = require('../models/models')
const bcrypt = require('bcrypt')
const { v4 } = require('uuid');
const mailService = require('./mail_service')
const tokenService = require('./token_service');
const UserDTO = require('../dtos/user_dto');
const ApiError = require('../exceptions/api_error');
const translateService = require('../service/translate_service')

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
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}?language=${language}`, language)
       
        await mailService.sendEmailToAdmin(`New ${role} registered`, 'App notification')
       
        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
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