const nodemailer = require('nodemailer');
const { UserInfo, User, NotificationHistory } = require('../models/models');
const translateService = require('../service/translate_service')
const { Op, where } = require("sequelize")

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