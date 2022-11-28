const { LimitCounter,  User, UserInfo, UserAppLimit } = require('../models/models')
const mailService = require('./mail_service')
const ApiError = require('../exceptions/api_error');
const timeService = require('./time_service')

class LimitService {

    async check_trial_used(userInfoId, planId) {
        let limit = await LimitCounter.findOne({ where: { userInfoId } })
        if (planId === 2 && limit.trial_used) {
            throw ApiError.badRequest(`Вы уже использовали пробный период`)
        }
    }
    async check_subscription(userInfoId, order_status, option) {
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
                throw ApiError.badRequest(`Вы достигли лимита заказов за 24 часа, доступного с вашей подпиской, лимит обновится в ${handledTime}. Вы можете изменить подписку в разделе Аккаунт. Вы также можете создать шаблон и отправить его, когда лимит обновится`)
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
                    throw ApiError.badRequest(`Вы достигли лимита взятия заказов в работу за 24 часа, доступного с вашей подпиской, лимит обновится в ${handledTime}. Вы можете изменить подписку в разделе Аккаунт`)
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
                    throw ApiError.badRequest(`Вы достигли лимита предложений за 24 часа, доступного с вашей подпиской, лимит обновится в ${handledTime}. Вы можете изменить подписку в разделе Аккаунт`)
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
    async check_account_activated(userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isActivated) {
            throw ApiError.badRequest(`Для выполнения действия активируйте аккаунт по ссылке полученной при регистрации, или запросите ссылку повторно в разделе аккаунт`)
        }
    }
    async check_account_moderated(userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isModerated) {
            throw ApiError.badRequest(`Для выполнения действия дождитесь модерации аккаунта`)
        }
        // признак немодерированного - аккаунта - выставлять после каждого изименения профиля в юзеринфо
    }
    async check_account_checked(userInfoId) {
        let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
        let user = await User.findOne({ where: { id: userInfo.userId } })
        if (!user.isChecked) {
            throw ApiError.badRequest(`Для выполнения действия необходим подтвержденный аккаунт, загрузите документы, мы проверим их в течении 24 часов`)
        }
        // признак непроверенного - аккаунта - выставлять после каждого изименения профиля в юзеринфо
    }
}

module.exports = new LimitService()