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

    async sendActivationMail(to, link, language, password, role) {
        await this.transport.sendMail({
            from: process.env.MAIL_FROM,
            to: to,
            bcc: '',
            subject: translateService.setNativeTranslate(language,
                {
                    russian: ['Ваш пароль и ссылка для активации вашего аккаунта logid'],
                    english: ['Your password and link to activate your logid account'],
                    spanish: ['Tu contraseña y enlace para activar tu cuenta logid'],
                    turkish: ['Logid hesabınızı etkinleştirmek için şifreniz ve bağlantınız'],
                    chinese: ['您的密码和激活 logid 帐户的链接'],
                    hindi: ['आपके लॉग इन खाते को सक्रिय करने के लिए आपका पासवर्ड और लिंक'],
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
                        russian: ['Для активации аккаунта перейдите по ссылке'],
                        english: ['To activate your account, follow the link'],
                        spanish: ['Para activar su cuenta, siga el enlace'],
                        turkish: ['Hesabınızı etkinleştirmek için bağlantıyı takip edin'],
                        chinese: ['要激活您的帐户，请点击链接'],
                        hindi: ['अपना खाता सक्रिय करने के लिए, लिंक का अनुसरण करें'],
                    }
                )} <a href=${link}>${link}</a></div>
            </div>
            <br/>
            ${role === 'carrier' ?
                    translateService.setNativeTranslate(language,
                        {
                            russian: ['Важно! Используйте все возможности нашего сервиса. В разделе аккаунт добавьте ваше фото или логотип компании. Отредактируйте ваш транспорт, добавьте фотографии и включите рекламу, мы покажем ваш транспорт на главной странице и в доске объявлений. Добавляйте весь ваш транспорт, разный транспорт - разные заказы. Больше объявлений на доске, больше звонков. Информация обо всех подходящих вам заказах будет приходить на электронную почту, переходите по ссылке из письма, берите заказы или делайте предложения. Отмечайте статус точек в заказе в процессе выполнения, это удобно заказчикам. Возите межгород? Включите дополнительные города отслеживания, это можно сделать на карте, на странице новых заказов, там же можно отключить заказы внутри города. Успешных перевозок!'],
                            english: ['Important! Use all the features of our service. In the account section, add your photo or company logo. Edit your vehicle, add photos and turn on advertising, we will show your vehicle on the main page and in the notice board. Add all your transport, different transport - different orders. More notices on the board, more calls. Information about all orders that suit you will be sent by email, follow the link from the letter, take orders or make offers. Mark the status of points in the order during the execution process, this is convenient for customers. Do you drive intercity? Enable additional tracking cities, this can be done on the map, on the new orders page, and there you can also disable orders within the city. Happy transportation!'],
                            spanish: ['¡Importante! Utilice todas las funciones de nuestro servicio. En la sección de cuenta, agregue su foto o logotipo de la empresa. Edita tu vehículo, añade fotos y activa publicidad, mostraremos tu vehículo en la página principal y en el tablón de anuncios. Agregue todo su transporte, transporte diferente, pedidos diferentes. Más avisos en el tablero, más llamadas. La información sobre todos los pedidos que le convengan se le enviará por correo electrónico, siga el enlace de la carta, tome pedidos o haga ofertas. Marque el estado de los puntos en la orden durante el proceso de ejecución, esto es conveniente para los clientes. ¿Conduces interurbano? Habilite ciudades de seguimiento adicionales, esto se puede hacer en el mapa, en la página de nuevos pedidos, y allí también puede deshabilitar pedidos dentro de la ciudad. ¡Feliz transporte!'],
                            turkish: ['Önemli! Hizmetimizin tüm özelliklerini kullanın. Hesap bölümüne fotoğrafınızı veya şirket logonuzu ekleyin. Aracınızı düzenleyin, fotoğraf ekleyin ve reklamı açın, aracınızı ana sayfada ve ilan panosunda gösterelim. Tüm taşımalarınızı, farklı taşımaları - farklı siparişleri ekleyin. Panoya daha fazla duyuru, daha fazla çağrı. Size uygun tüm siparişlerle ilgili bilgiler e-posta ile gönderilecek, mektuptaki bağlantıyı takip edecek, sipariş alacak veya teklifte bulunacaksınız. Yürütme işlemi sırasında siparişteki noktaların durumunu işaretleyin, bu müşteriler için uygundur. Şehirlerarası araç mı kullanıyorsunuz? Ek şehir takibini etkinleştirin, bunu haritada, yeni siparişler sayfasında yapabilirsiniz ve orada şehir içindeki siparişleri de devre dışı bırakabilirsiniz. Mutlu ulaşım!'],
                            chinese: ['重要的！ 使用我們服務的所有功能。 在帳戶部分，新增您的照片或公司徽標。 編輯您的車輛，添加照片並打開廣告，我們將在主頁和公告板上顯示您的車輛。 增加您所有的交通工具，不同的交通工具 - 不同的訂單。 董事會上的通知更多，電話更多。 有關所有適合您的訂單的資訊將透過電子郵件發送，請點擊信中的鏈接，接受訂單或提出報價。 在訂單執行過程中標記點的狀態，方便客戶。 你開城際車嗎？ 啟用其他追蹤城市，這可以在地圖上的新訂單頁面上完成，您也可以在該頁面上停用城市內的訂單。 交通愉快！'],
                            hindi: ['महत्वपूर्ण! हमारी सेवा की सभी सुविधाओं का उपयोग करें। खाता अनुभाग में, अपना फ़ोटो या कंपनी का लोगो जोड़ें। अपने वाहन को संपादित करें, फ़ोटो जोड़ें और विज्ञापन चालू करें, हम आपके वाहन को मुख्य पृष्ठ और नोटिस बोर्ड पर दिखाएंगे। अपने सभी परिवहन, अलग-अलग परिवहन - अलग-अलग ऑर्डर जोड़ें। बोर्ड पर अधिक सूचनाएं, अधिक कॉलें। आपके लिए उपयुक्त सभी ऑर्डरों की जानकारी ईमेल द्वारा भेजी जाएगी, पत्र के लिंक का अनुसरण करें, ऑर्डर लें या ऑफ़र दें। निष्पादन प्रक्रिया के दौरान आदेश में बिंदुओं की स्थिति को चिह्नित करें, यह ग्राहकों के लिए सुविधाजनक है। क्या आप इंटरसिटी चलाते हैं? अतिरिक्त ट्रैकिंग शहरों को सक्षम करें, यह मानचित्र पर, नए ऑर्डर पृष्ठ पर किया जा सकता है, और वहां आप शहर के भीतर ऑर्डर को अक्षम भी कर सकते हैं। शुभ परिवहन!'],
                        }
                    )
                    :
                    role === 'customer' ?
                        ''
                        : ''}
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