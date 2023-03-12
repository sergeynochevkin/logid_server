const nodemailer = require('nodemailer');
const { UserInfo, User } = require('../models/models');
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

    async sendManagementEmail(subject, message, members) {
        let users = await User.findAll({ where: { id: { [Op.in]:members } } })
        // console.log('Here!');
        // console.log(users);

        for (const user of users) {
            let userInfo = await UserInfo.findOne({ where: { userId: user.dataValues.id } })
            if (!userInfo) {
                await this.transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: user.dataValues.email,
                    bcc: '',
                    subject: subject,
                    text: message
                })
            }
            else {
                await this.transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: userInfo.dataValues.email,
                    bcc: '',
                    subject: subject,
                    text: message
                })
            }
        }
    }
}

module.exports = new MailService()