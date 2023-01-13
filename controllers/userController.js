const jwt = require('jsonwebtoken')
const userService = require('../service/user_service')
const translateService = require('../service/translate_service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api_error')
const { User, ServerNotification, Translation } = require('../models/models')


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
            const { email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted } = req.body
            const userData = await userService.registration(email, password, role, language, country, user_agreement_accepted, privacy_policy_accepted, age_accepted, cookies_accepted)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true /*, https:true */ })
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            let { userId, email, password, language } = req.body
            const userData = await userService.update(userId, email, password, language)
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
            await userService.password_update_code(email, language)
            return res.send('code send')
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password, language } = req.body
            const userData = await userService.login(email, password, language)
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
            userService.generate_link(email, language)
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


