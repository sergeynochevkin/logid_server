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
                    english: ['Link to activate your logid account'],
                    spanish: ['Enlace para activar tu cuenta logid'],
                    turkish: ['Logid hesabınızı etkinleştirme bağlantısı'],
                    chinese: ['激活您的 logid 帐户的链接'],
                    hindi: ['अपने "लॉगिड" खाते को सक्रिय करने के लिए लिंक'],
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
                    english: ['You have been registered as a driver in the logid service'],
                    spanish: ['Has sido registrado como conductor en el servicio logid'],
                    turkish: ['Logid servisine sürücü olarak kaydoldunuz'],
                    chinese: ['您已在logid服务中注册为司机'],
                    hindi: ['आपको "लॉगिड" सेवा में ड्राइवर के रूप में पंजीकृत किया गया है'],
                }
            ),
            html:
                `
                        <div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Ваш логин'],
                        english: ['Your login'],
                        spanish: ['Su nombre de usuario'],
                        turkish: ['Kullanıcı girişin'],
                        chinese: ['您的登录信息'],
                        hindi: ['अपना लॉगिन'],

                    }
                )}: ${to}</div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Ваш пароль'],
                        english: ['Your password'],
                        spanish: ['Tu contraseña'],
                        turkish: ['Şifreniz'],
                        chinese: ['你的密码'],
                        hindi: ['आपका पासवर्ड'],
                    }
                )}: ${password}</div>
                    <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['В целях безопасности, пожалуйста, сохраните пароль и удалите это письмо. Вы можете изменить пароль после авторизации в разделе аккаунт'],
                        english: ['For security reasons, please save your password and delete this email. You can change your password after authorization in the account section'],
                        spanish: ['Por razones de seguridad, guarde su contraseña y elimine este correo electrónico. Puede cambiar su contraseña después de la autorización en la sección de cuenta'],
                        turkish: ['Güvenlik nedeniyle lütfen şifrenizi kaydedin ve bu e-postayı silin. Hesap bölümünden yetkilendirme sonrasında şifrenizi değiştirebilirsiniz.'],
                        chinese: ['出于安全原因，请保存您的密码并删除此电子邮件。 您可以在账户部分授权后修改密码'],
                        hindi: ['सुरक्षा कारणों से, कृपया अपना पासवर्ड सहेजें और इस ईमेल को हटा दें। आप खाता अनुभाग में प्राधिकरण के बाद अपना पासवर्ड बदल सकते हैं'],
                    }
                )}</div>
                        <div>${translateService.setNativeTranslate(language,
                    {
                        russian: ['Для авторизации перейдите по ссылке'],
                        english: ['For authorization follow the link'],
                        spanish: ['Para iniciar sesión, siga el enlace'],
                        turkish: ['Giriş yapmak için bağlantıyı takip edin'],
                        chinese: ['要登录，请点击链接'],
                        hindi: ['लॉग इन करने के लिए, लिंक का अनुसरण करें'],
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
                    english: ['The code to change the password of your logid account'],
                    spanish: ['El código para cambiar la contraseña de tu cuenta logid'],
                    turkish: ['Logid hesabınızın şifresini değiştirme kodu'],
                    chinese: ['更改logid帐户密码的代码'],
                    hindi: ['आपके "लॉगिड" खाते का पासवर्ड बदलने के लिए कोड'],
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