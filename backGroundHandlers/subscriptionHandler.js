const { defaults } = require('pg');
const { UserInfo, Subscription, UserAppState } = require('../models/models');
const time_service = require('../service/time_service');
const mail_service = require('../service/mail_service');
const translate_service = require('../service/translate_service');
const limit_service = require('../service/limit_service');

module.exports = async function () {

    console.log('subscriptions handler started...');

    // get all subscriptions, may be not all?
    let subscriptions
    await Subscription.findAll().then(data => {
        subscriptions = data
    })

    let three_days = 1000 * 60 * 60 * 24 * 3
    let two_days = 1000 * 60 * 60 * 24 * 2
    let one_day = 1000 * 60 * 60 * 24 * 1

    // create test subscriptions here!
    // let userInfoId = 1
    // let initialTime = new Date();

    // initialTime.setHours(23, 59, 59, 0)
    // let paid_to_2 = time_service.setTime(initialTime, 1440 * 1, 'form')
    // let paid_to_3 = time_service.setTime(initialTime, 1440 * 2, 'form')
    // let paid_to_4 = time_service.setTime(initialTime, 1440 * 3, 'form')
    // let paid_to_5 = time_service.setTime(initialTime, 0, 'form')

    // await Subscription.findOrCreate({ where: { id: 2 }, defaults: { userInfoId, planId: 6, country: 'russia', paid_to: paid_to_2 } })
    // await Subscription.findOrCreate({ where: { id: 3 }, defaults: { userInfoId, planId: 6, country: 'russia', paid_to: paid_to_3 } })
    // await Subscription.findOrCreate({ where: { id: 4 }, defaults: { userInfoId, planId: 6, country: 'russia', paid_to: paid_to_4 } })
    // await Subscription.findOrCreate({ where: { id: 5 }, defaults: { userInfoId, planId: 6, country: 'russia', paid_to: paid_to_5 } })

    subscriptions.forEach(async element => {

        let now = new Date().getTime()
        let paid_to = new Date(element.paid_to).getTime()

        let state_data = await UserAppState.findOne({ where: { userInfoId: element.userInfoId } })
        let userInfoObject = await UserInfo.findOne({ where: { id: element.userInfoId } })
        let state = JSON.parse(state_data.dataValues.state)
        let language = state.language

        //just for russia now!
        if (userInfoObject.dataValues.country === 'russia') {

            if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 1 < now) {
                await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Остался 1 день до отключения подписки'],
                            english: ['1 day left until the subscription is canceled'],
                            spanish: ['Queda 1 día para cancelar la suscripción'],
                            turkish: ['Aboneliğin iptal edilmesine 1 gün kaldı'],
                            chinese: ['距取消订阅还剩 1 天'],
                            hindi: ['सदस्यता रद्द होने तक 1 दिन शेष है'],
                        }
                    ),
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Остался один день до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                            english: ['There is one day left until the end of the subscription in our service, extend it in the account section'],
                            spanish: ['Queda un día para que finalice tu suscripción en nuestro servicio, renuevala en la sección cuenta'],
                            turkish: ['Hizmetimizde aboneliğinizin bitmesine bir gün kaldı, hesap bölümünden yenileyin'],
                            chinese: ['距离您的服务订阅结束还有一天，请在帐户部分续订'],
                            hindi: ['हमारी सेवा में आपकी सदस्यता समाप्त होने में एक दिन शेष है, इसे खाता अनुभाग में नवीनीकृत करें'],
                        }
                    ))
            }

            else if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 2 < now) {
                await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Осталось 2 дня до отключения подписки'],
                            english: ['2 days left until the subscription is canceled'],
                            spanish: ['Quedan 2 días antes de la desactivación de la suscripción'],
                            turkish: ['Aboneliğin devre dışı bırakılmasına 2 gün kaldı'],
                            chinese: ['距订阅停用还剩 2 天'],
                            hindi: ['सदस्यता निष्क्रिय होने में 2 दिन शेष हैं'],
                        }
                    ),
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Осталось два дня до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                            english: ['There are two days left before the end of the subscription in our service, extend it in the account section'],
                            spanish: ['Quedan dos días para que finalice tu suscripción en nuestro servicio, renuevala en la sección cuenta'],
                            turkish: ['Hizmetimizde aboneliğinizin bitmesine iki gün kaldı, hesap bölümünden yenileyin'],
                            chinese: ['距离您的服务订阅结束还有两天，请在帐户部分续订'],
                            hindi: ['हमारी सेवा में आपकी सदस्यता समाप्त होने में दो दिन शेष हैं, इसे खाता अनुभाग में नवीनीकृत करें'],
                        }
                    ))
            }

            else if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 3 < now) {
                await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Осталось 3 дня до отключения подписки'],
                            english: ['3 days left until the subscription is canceled'],
                            spanish: ['Quedan 3 días antes de la desactivación de la suscripción'],
                            turkish: ['Aboneliğin devre dışı bırakılmasına 3 gün kaldı'],
                            chinese: ['距订阅停用还剩 3 天'],
                            hindi: ['सदस्यता निष्क्रिय होने में 3 दिन शेष हैं'],
                        }
                    ),
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Осталось три дня до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                            english: ['There are three days left before the end of the subscription in our service, extend it in the account section'],
                            spanish: ['Quedan tres días para que finalice tu suscripción en nuestro servicio, renuevala en la sección cuenta'],
                            turkish: ['Hizmetimizde aboneliğinizin bitmesine üç gün kaldı, hesap bölümünden yenileyin'],
                            chinese: ['距离您的服务订阅结束还有三天，请在帐户部分续订'],
                            hindi: ['हमारी सेवा में आपकी सदस्यता समाप्त होने में तीन दिन शेष हैं, इसे खाता अनुभाग में नवीनीकृत करें'],
                        }
                    ))
            }

            else if (paid_to < now) {
                await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Срок действия подписки истек'],
                            english: ['Subscription expired'],
                            spanish: ['La suscripción ha caducado'],
                            turkish: ['Aboneliğin süresi doldu'],
                            chinese: ['订阅已过期'],
                            hindi: ['सदस्यता समाप्त हो गई है'],
                        }
                    ),
                    translate_service.setNativeTranslate(language,
                        {
                            russian: ['Срок действия подписки истек. Вы можете оформить новую подписку в разделе аккаунт'],
                            english: ['Subscription expired. You can sign up for a new subscription in the account section'],
                            spanish: ['Su suscripción ha expirado. Puede registrarse para obtener una nueva suscripción en la sección de cuenta'],
                            turkish: ['Aboneliğinizin süresi doldu. Hesap bölümünden yeni bir abonelik için kaydolabilirsiniz'],
                            chinese: ['您的订阅已过期。 您可以在帐户部分注册新的订阅'],
                            hindi: ['आपकी सदस्यता समाप्त हो गई है. आप खाता अनुभाग में नई सदस्यता के लिए साइन अप कर सकते हैं'],
                        }
                    ))

                //subscription cancelation
                let userInfo = { ...userInfoObject.dataValues }

                let initialTime = new Date();
                initialTime.setHours(23, 59, 59, 0)
                let paid_to = time_service.setTime(initialTime, 1440 * 365 * 300, 'form')// 300 years
                let planId = 1

                await Subscription.update({ planId, paid_to }, { where: { userInfoId: element.userInfoId } })
                limit_service.setSubscriptionLimits(planId, userInfo)
            }
        }

    });

    console.log('subscriptions handled!');
}