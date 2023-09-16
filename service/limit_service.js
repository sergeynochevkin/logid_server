const { LimitCounter, User, UserInfo, UserAppLimit, SubscriptionOptionsByPlan, SubscriptionOption } = require('../models/models')
const mailService = require('./mail_service')
const ApiError = require('../exceptions/api_error');
const timeService = require('./time_service')
const translateService = require('../service/translate_service')
const { Op } = require("sequelize")

class LimitService {

    async setSubscriptionLimits(planId, userInfo) {

        let userObject = await User.findOne({ where: { id: userInfo.userId } })
        let user = { ...userObject.dataValues }

        let currentTime = new Date()
        let optionsByPlan = await SubscriptionOptionsByPlan.findAll({ where: { planId } })
        optionsByPlan = optionsByPlan.map(el => el.optionId)
        let options = await SubscriptionOption.findAll({ where: { option_id: { [Op.in]: optionsByPlan }, country: userInfo.country } })
        let userInfoId = userInfo.id

        if (user.role === 'customer') {
            let customer_create_order_limit_per_day = options.find(el => el.role === 'customer' && el.type === 'order')
            customer_create_order_limit_per_day = customer_create_order_limit_per_day.limit
            let customer_new_order_range = options.find(el => el.role === 'customer' && el.type === 'order_range')
            customer_new_order_range = customer_new_order_range.limit
            let customer_new_order_point_limit = options.find(el => el.role === 'customer' && el.type === 'point_limit')
            customer_new_order_point_limit = customer_new_order_point_limit.limit
            await UserAppLimit.update({ customer_create_order_limit_per_day, customer_new_order_range, customer_new_order_point_limit }, { where: { userInfoId } })
            await LimitCounter.update({ customer_create_amount_per_day: 0, customer_create_started: currentTime }, { where: { userInfoId } })
        }

        if (user.role === 'carrier') {
            let carrier_offer_limit_per_day = options.find(el => el.role === 'carrier' && el.type === 'offer')
            carrier_offer_limit_per_day = carrier_offer_limit_per_day.limit
            let carrier_take_order_limit_per_day = options.find(el => el.role === 'carrier' && el.type === 'take_order')
            carrier_take_order_limit_per_day = carrier_take_order_limit_per_day.limit
            let carrier_take_order_city_limit = options.find(el => el.role === 'carrier' && el.type === 'order_range')
            carrier_take_order_city_limit = carrier_take_order_city_limit.limit
            await UserAppLimit.update({ carrier_offer_limit_per_day, carrier_take_order_limit_per_day, carrier_take_order_city_limit }, { where: { userInfoId } })
            await LimitCounter.update({ carrier_offer_amount_per_day: 0, carrier_take_order_amount_per_day: 0, carrier_take_order_started: currentTime, carrier_offer_started: currentTime }, { where: { userInfoId } })
        }

        return null
    }

    async check_trial_used(language, userInfoId, planId) {
        let limit = await LimitCounter.findOne({ where: { userInfoId } })
        if (planId === 2 && limit.trial_used) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Вы уже использовали пробный период'],
                    english: ['You have already used the trial period'],
                    spanish: ['Ya has utilizado el periodo de prueba.'],
                    turkish: ['Deneme süresini zaten kullandınız'],
                    chinese: ['您已经使用了试用期'],
                    hindi: ['आप पहले ही परीक्षण अवधि का उपयोग कर चुके हैं'],
                
                }
            ))
        }
    }
    async check_subscription(language, userInfoId, order_status, option) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        let counter = await LimitCounter.findOne({ where: { userInfoId } })
        let limits = await UserAppLimit.findOne({ where: { userInfoId } })
        let currentTime = new Date()
        let handledTime
        if (user.role === 'customer') {
            let refreshTime = new Date(counter.customer_create_started)
            refreshTime = refreshTime.setDate(refreshTime.getDate() + 1)
            handledTime = timeService.setTime(new Date(refreshTime), 0, 'show')
            if (counter.customer_create_amount_per_day === 0) {
                await LimitCounter.update({ customer_create_started: currentTime }, { where: { userInfoId } })
            }
            if (currentTime >= refreshTime) {
                await LimitCounter.update({ customer_create_amount_per_day: 0 }, { where: { userInfoId } })
            }
            if (counter.customer_create_amount_per_day >= limits.customer_create_order_limit_per_day && order_status !== 'pattern') {
                throw ApiError.badRequest(translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы достигли лимита заказов за 24 часа, доступного с вашей подпиской, лимит обновится в', handledTime, '. Вы можете изменить подписку в разделе Аккаунт. Вы также можете создать шаблон и отправить его, когда лимит обновится'],
                        english: ['You have reached the 24 hour order limit available with your subscription, the limit will be updated at', handledTime, '. You can change your subscription in the Account section. You can also create a template and send it when the limit is updated'],
                        spanish: ['Ha alcanzado el límite de pedidos de 24 horas disponible con su suscripción, el límite se actualizará en', handledTime, '. Puedes cambiar tu suscripción en la sección Cuenta. También puedes crear una plantilla y enviarla cuando se actualice el límite'],
                        turkish: ['Aboneliğinizde mevcut olan 24 saatlik sipariş limitine ulaştınız, limit şu tarihte güncellenecektir:', handledTime, '. Aboneliğinizi Hesap bölümünden değiştirebilirsiniz. Ayrıca bir şablon oluşturabilir ve limit güncellendiğinde gönderebilirsiniz'],
                        chinese: ['您已达到订阅的 24 小时订单限制，该限制将于', handledTime, '. 您可以在“帐户”部分更改您的订阅。 您还可以创建模板并在限制更新时发送'],
                        hindi: ['आप अपनी सदस्यता के साथ उपलब्ध 24 घंटे की ऑर्डर सीमा तक पहुंच गए हैं, सीमा को अपडेट किया जाएगा', handledTime, '. आप खाता अनुभाग में अपनी सदस्यता बदल सकते हैं. आप एक टेम्प्लेट भी बना सकते हैं और सीमा अपडेट होने पर उसे भेज सकते हैं'],
                    
                    }
                ))
            }
        }
        if (user.role === 'carrier') {
            if (option === 'order') {
                let refreshTime = new Date(counter.carrier_take_order_started)
                refreshTime = refreshTime.setDate(refreshTime.getDate() + 1)
                handledTime = timeService.setTime(new Date(refreshTime), 0, 'show')
                if (counter.carrier_take_order_amount_per_day === 0) {
                    await LimitCounter.update({ carrier_take_order_started: currentTime }, { where: { userInfoId } })
                }
                if (currentTime >= refreshTime) {
                    await LimitCounter.update({ carrier_take_order_amount_per_day: 0 }, { where: { userInfoId } })
                }
                if (counter.carrier_take_order_amount_per_day >= limits.carrier_take_order_limit_per_day) {
                    throw ApiError.badRequest(translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы достигли лимита взятия заказов в работу за 24 часа, доступного с вашей подпиской, лимит обновится в', handledTime, '. Вы можете изменить подписку в разделе Аккаунт'],
                            english: ['You have reached the 24-hour take order limit available with your subscription, the limit will be updated at', handledTime, '. You can change your subscription in the Account section'],
                            spanish: ['Ha alcanzado el límite de pedidos de 24 horas disponible con su suscripción; el límite se actualizará en', handledTime, '. Puedes cambiar tu suscripción en la sección cuenta'],
                            turkish: ['Aboneliğinizde mevcut olan 24 saatlik sipariş alma limitine ulaştınız, limit şu tarihte güncellenecektir:', handledTime, '. Aboneliğinizi Hesap bölümünden değiştirebilirsiniz'],
                            chinese: ['您已达到订阅的 24 小时接受订单限制，该限制将于', handledTime, '. 您可以在“帐户”部分更改您的订阅'],
                            hindi: ['आप अपनी सदस्यता के साथ उपलब्ध 24-घंटे की ऑर्डर लेने की सीमा तक पहुंच गए हैं, सीमा को अपडेट किया जाएगा', handledTime, '. आप खाता अनुभाग में अपनी सदस्यता बदल सकते हैं'],
                        
                        }
                    ))
                }
            }
            if (option === 'offer') {
                let refreshTime = new Date(counter.carrier_offer_started)
                refreshTime = refreshTime.setDate(refreshTime.getDate() + 1)
                handledTime = timeService.setTime(new Date(refreshTime), 0, 'show')
                if (counter.carrier_offer_amount_per_day === 0) {
                    await LimitCounter.update({ carrier_offer_started: currentTime }, { where: { userInfoId } })
                }
                if (currentTime >= refreshTime) {
                    await LimitCounter.update({ carrier_offer_amount_per_day: 0 }, { where: { userInfoId } })
                }
                if (counter.carrier_offer_amount_per_day >= limits.carrier_offer_limit_per_day) {
                    throw ApiError.badRequest(translateService.setNativeTranslate(language,
                        {
                            russian: ['Вы достигли лимита предложений за 24 часа, доступного с вашей подпиской, лимит обновится в', handledTime, '. Вы можете изменить подписку в разделе Аккаунт'],
                            english: ['You have reached the 24-hour offer limit available with your subscription, the limit will update in', handledTime, '. You can change your subscription in the Account section'],
                            spanish: ['Ha alcanzado el límite de oferta de 24 horas disponible con su suscripción; el límite se actualizará en', handledTime, '. Puedes cambiar tu suscripción en la sección cuenta'],
                            turkish: ['Aboneliğinizle kullanılabilen 24 saatlik teklif sınırına ulaştınız; sınır şu tarihte güncellenecektir:', handledTime, '. Aboneliğinizi Hesap bölümünden değiştirebilirsiniz'],
                            chinese: ['您已达到订阅的 24 小时优惠限制，该限制将在', handledTime, '. 您可以在“帐户”部分更改您的订阅'],
                            hindi: ['आप अपनी सदस्यता के साथ उपलब्ध 24-घंटे की ऑफ़र सीमा तक पहुंच गए हैं, सीमा अपडेट हो जाएगी', handledTime, '. आप खाता अनुभाग में अपनी सदस्यता बदल सकते हैं'],
                        
                        }
                    ))
                }
            }
            return null
        }
    }
    async increase(userInfoId, order_status, option) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        let counter = await LimitCounter.findOne({ where: { userInfoId } })
        if (user.role === 'customer' && order_status !== 'pattern') {
            let currentCount = counter.customer_create_amount_per_day
            await LimitCounter.update({ customer_create_amount_per_day: currentCount + 1 }, { where: { userInfoId } })
        }
        if (user.role === 'carrier' && option === 'order') {
            let currentCount = counter.carrier_take_order_amount_per_day
            await LimitCounter.update({ carrier_take_order_amount_per_day: currentCount + 1 }, { where: { userInfoId } })
        }
        if (user.role === 'carrier' && option === 'offer') {
            let currentCount = counter.carrier_offer_amount_per_day
            await LimitCounter.update({ carrier_offer_amount_per_day: currentCount + 1 }, { where: { userInfoId } })
        }
    }
    async check_account_activated(language, userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isActivated) {
            throw ApiError.badRequest(translateService.setNativeTranslate(language,
                {
                    russian: ['Для выполнения действия активируйте аккаунт по ссылке полученной при регистрации, или запросите ссылку повторно в разделе аккаунт'],
                    english: ['To perform the action, activate your account using the link received during registration, or request the link again in the account section'],
                    spanish: ['Para realizar la acción, active su cuenta utilizando el enlace recibido durante el registro, o solicite el enlace nuevamente en la sección de cuenta'],
                    turkish: ['İşlemi gerçekleştirmek için kayıt sırasında aldığınız bağlantıyı kullanarak hesabınızı etkinleştirin veya hesap bölümünde bağlantıyı tekrar isteyin'],
                    chinese: ['要执行该操作，请使用注册期间收到的链接激活您的帐户，或在帐户部分再次请求该链接'],
                    hindi: ['कार्रवाई करने के लिए, पंजीकरण के दौरान प्राप्त लिंक का उपयोग करके अपना खाता सक्रिय करें, या खाता अनुभाग में फिर से लिंक का अनुरोध करें'],
                
                }
            ))
        }
    }
    async check_account_moderated(language, userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isModerated) {
            throw ApiError.badRequest(ranslateService.setNativeTranslate(language,
                {
                    russian: ['Для выполнения действия дождитесь модерации аккаунта'],
                    english: ['Wait for account moderation to complete the action'],
                    spanish: ['Para realizar la acción, espera a que tu cuenta sea moderada'],
                    turkish: ['İşlemi gerçekleştirmek için hesabınızın denetlenmesini bekleyin'],
                    chinese: ['要执行该操作，请等待您的帐户得到审核'],
                    hindi: ['कार्रवाई करने के लिए, अपने खाते के मॉडरेट होने तक प्रतीक्षा करें'],
                
                }
            ))
        }
        // признак немодерированного - аккаунта - выставлять после каждого изименения профиля в юзеринфо
    }
    async check_account_checked(language, userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isChecked) {
            throw ApiError.badRequest(
                translateService.setNativeTranslate(language,
                    {
                        russian: ['Для выполнения действия необходим подтвержденный аккаунт, загрузите документы, мы проверим их в течении 24 часов'],
                        english: ['To perform the action, you need a verified account, upload the documents, we will check them within 24 hours'],
                        spanish: ['Para realizar la acción, necesita una cuenta verificada, cargue los documentos, los revisaremos dentro de las 24 horas'],
                        turkish: ['İşlemi gerçekleştirmek için doğrulanmış bir hesaba ihtiyacınız var, belgeleri yükleyin, 24 saat içinde kontrol edeceğizn'],
                        chinese: ['要执行此操作，您需要一个经过验证的帐户，上传文件，我们将在 24 小时内检查'],
                        hindi: ['कार्रवाई करने के लिए, आपको एक सत्यापित खाते की आवश्यकता है, दस्तावेज़ अपलोड करें, हम 24 घंटे के भीतर उनकी जांच करेंगे'],
                    
                    }
                ))
        }
        // признак непроверенного - аккаунта - выставлять после каждого изименения профиля в юзеринфо
    }
}

module.exports = new LimitService()