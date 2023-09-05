const nodemailer = require('nodemailer');
const { UserInfo, User, NotificationHistory } = require('../models/models');
const translateService = require('../service/translate_service')
const { Op, where } = require("sequelize");
const ApiError = require('../exceptions/api_error');

class MailService {

    constructor() {
        this.transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })
    }

    async sendUserMail(to, subject, message, html, link) {
        try {
            await this.transport.sendMail({
                from: process.env.MAIL_FROM,
                to: to,
                bcc: '',
                subject: subject,
                html:
                    `
                <div>${message}</div>
                <br/>
                <div>
                <a href="https://logid.app/">https://logid.app/</a>
                </div>`
            })
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async sendActivationMail(to, link, language) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setNativeTranslate(language,
                {
                    russian: ['Ссылка для активации вашего аккаунта logid'],
                    english: ['Link to activate your logid account']
                }
            ),
            html:
                `
                        <div>
                        <a href="${link}">${link}</a>
                        </div>
            `
        })
    }

    async sendCredentialsEmail(to, link, password, role, language,) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setNativeTranslate(language,
                {
                    russian: ['Вас зарегистрировали водителем в сервисе logid'],
                    english: ['You have been registered as a driver in the logid service']
                }
            ),
            html:
                `
                        <div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Ваш логин'],
                        english: ['Your login']
                    }
                )}: ${to}</div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Ваш пароль'],
                        english: ['You password']
                    }
                )}: ${password}</div>
                    <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['В целях безопасности, пожалуйста, сохраните пароль и удалите это письмо. Вы можете изменить пароль после авторизации в разделе аккаунт'],
                        english: ['For security reasons, please save your password and delete this email. You can change your password after authorization in the account section']
                    }
                )}</div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Для авторизации перейдите по ссылке'],
                        english: ['For authorization follow the link']
                    }
                )} <a href=${link}>${link}</a></div>
                        </div>
            `
        })
    }

    async sendEmailRecoveryCode(to, code, language) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setNativeTranslate(language,
                {
                    russian: ['Код для изменения пароля вашего аккаунта logid'],
                    english: ['The code to change the password of your logid account']
                }
            ),
            text: code
        })
    }

    async sendEmailToAdmin(subject, text) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: 'sergey.nochevkin@gmail.com',
            bcc: '',
            subject: subject,
            text: text
        })
    }

    async sendManagementEmail(subject, message, to, userId, userInfoId) {
        try {
            await this.transport.sendMail({
                from: process.env.MAIL_FROM,
                to: to,
                bcc: '',
                subject: subject,
                // text: message,
                html:
                    `
                        <div>${message}</div>
                        <br/>
                        <div>
                        <a href="https://logid.app/">https://logid.app/</a>
                        </div>`
            })
            NotificationHistory.create({ userId, userInfoId, type: 'email', subject, message, status: 'success' })

        } catch (error) {
            NotificationHistory.create({ userId, userInfoId, type: 'email', subject, message, status: 'error' })
            console.log(error);
        }
    }
}

module.exports = new MailService()