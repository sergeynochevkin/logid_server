const nodemailer = require('nodemailer');
const translateService = require('../service/translate_service')

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

    async sendActivationMail(to, link) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setTranslate(
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

    async sendEmailRecoveryCode(to, code) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setTranslate(
                {
                    russian: ['Код для изменения пароля вашего аккаунта logid'],
                    english: ['The code to change the password of your logid account']
                }
            ),
            text: code
        })
    }
}

module.exports = new MailService()