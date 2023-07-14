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
        let state = JSON.parse(state_data.dataValues.state)
        let language = state.language

        if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 1 < now) {
            await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Остался 1 день до отключения подписки'],
                        english: ['1 day left until the subscription is canceled']
                    }
                ),
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Остался один день до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                        english: ['There is one day left until the end of the subscription in our service, extend it in the account section']
                    }
                ))
        }

        else if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 2 < now) {
            await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Осталось 2 дня до отключения подписки'],
                        english: ['2 days left until the subscription is canceled']
                    }
                ),
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Осталось два дня до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                        english: ['There are two days left before the end of the subscription in our service, extend it in the account section']
                    }
                ))
        }

        else if (paid_to > now && paid_to - 60 * 1000 * 60 * 24 * 3 < now) {
            await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Осталось 3 дня до отключения подписки'],
                        english: ['3 days left until the subscription is canceled']
                    }
                ),
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Осталось три дня до окончания подписики в нашем сервисе, продлите ее в разделе аккаунт'],
                        english: ['There are three days left before the end of the subscription in our service, extend it in the account section']
                    }
                ))
        }

        else if (paid_to < now) {
            await mail_service.sendUserMail('sergey.nochevkin@gmail.com',
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Срок действия подписки истек'],
                        english: ['Subscription expired']
                    }
                ),
                translate_service.setNativeTranslate(language,
                    {
                        russian: ['Срок действия подписки истек. Вы можете оформить новую подписку в разделе аккаунт'],
                        english: ['Subscription expired. You can sign up for a new subscription in the account section']
                    }
                ))

            //subscription cancelation
            let userInfoObject = UserInfo.findOne({ where: { id: element.userInfoId } })
            let userInfo = { ...userInfoObject.dataValues }

            let initialTime = new Date();
            initialTime.setHours(23, 59, 59, 0)
            let paid_to = time_service.setTime(initialTime, 1440 * 365 * 300, 'form')// 300 years
            let planId = 1

            await Subscription.update({ planId, paid_to }, { where: { userInfoId: element.userInfoId } })
            limit_service.setSubscriptionLimits(planId, userInfo)
        }

    });

    console.log('subscriptions handled!');
}