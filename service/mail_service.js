const nodemailer = require('nodemailer');

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
            subject: 'Ссылка для активации вашего аккаунта logid',
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
            subject: 'Код для изменения пароля вашего аккаунта logid',
            text: code
        })
    }
}

module.exports = new MailService()