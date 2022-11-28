const { User, ServerNotification, UserInfo } = require('../models/models')
const bcrypt = require('bcrypt')
const { v4 } = require('uuid');
const mailService = require('./mail_service')
const tokenService = require('./token_service');
const UserDTO = require('../dtos/user_dto');
const ApiError = require('../exceptions/api_error');

class UserService {

    async registration(email, password, role) {
        if (!email || !password) {
            throw ApiError.badRequest('Не корректный email или пароль')
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            throw ApiError.badRequest('email уже занят')
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const activationLink = v4()
        const user = await User.create({ email, password: hashPassword, role, activationLink })
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`)
        const userDto = new UserDTO(user)
        const tokens = await tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens,
            user: userDto
        }
    }

    async update(userId, email, password) {
        if (!email && password) {
            const candidate = await User.findOne({ where: { id: userId } })
            let comparePassword = bcrypt.compareSync(password, candidate.password)
            if (comparePassword) {
                throw ApiError.badRequest('Вы ввели действующий пароль')
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
                    throw ApiError.badRequest('Вы ввели действующий email')
                }
                else {
                    throw ApiError.badRequest('email уже занят')
                }
            }
            const activationLink = v4()
            await User.update({ email, activationLink, isActivated: false }, { where: { id: userId } })
            const user = await User.findOne({ where: { id: userId } })
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`)
            const userDto = new UserDTO(user)
            const tokens = await tokenService.generateTokens({ ...userDto })
            await tokenService.saveToken(userDto.id, tokens.refreshToken)
            return {
                ...tokens,
                user: userDto
            }
        }
    }

    async generate_link(email) {
        const activationLink = v4()
        await User.update({ activationLink }, { where: { email } })
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`)
        return null
    }

    async restore(password, code) {
        const candidate = await User.findOne({ where: { emailRecoveryCode: code } })
        if (!candidate) {
            throw ApiError.badRequest('Неверный код подтверждения')
        } else {
            let comparePassword = bcrypt.compareSync(password, candidate.password)
            if (comparePassword) {
                throw ApiError.badRequest('Вы ввели действующий пароль')
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

    async password_update_code(email) {
        const candidate = await User.findOne({ where: { email } })
        if (!candidate) {
            throw ApiError.badRequest('Вы ввели не корректный email')
        }
        const emailRecoveryCode = v4()
        await User.update({ emailRecoveryCode }, { where: { email } })
        await mailService.sendEmailRecoveryCode(email, `${emailRecoveryCode}`)
    }

    async activate(activationLink) {
        let uuid = activationLink
        const user = await User.findOne({ where: { activationLink } })
        if (!user) {
            await ServerNotification.create({  message: 'Неверная ссылка активации ', type: 'error', uuid: activationLink })
        } else {
            const userInfo = await UserInfo.findOne({ where: { userId: user.id } })
            if (user.isActivated) {
                await ServerNotification.create({  message: 'Аккаунт уже активирован', type: 'error', uuid: activationLink })
            } else {
                await User.update({ isActivated: true }, { where: { id: user.id } })
                await ServerNotification.create({ userInfoId: userInfo.id, message: 'Вы активировали аккаунт', type: 'success', uuid: activationLink })
            }
        }
        return uuid
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw ApiError.badRequest('Пользователя с таким email не существует')
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            throw ApiError.badRequest('Нееверный пароль')
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