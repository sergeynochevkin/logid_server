const { Subscription, SubscriptionOptionsByPlan, SubscriptionOption, User, UserInfo, LimitCounter, SubscriptionPlan, UserAppLimit } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require('sequelize')
const limitService = require('../service/limit_service')

class SubscriptionController {


    async update(req, res, next) {
        let { userInfoId, planId, paid_to } = req.body
        let currentTime = new Date()

        let currentPlan = await Subscription.findOne({ where: { userInfoId } })

        try {
            await limitService.check_trial_used(userInfoId, planId)
            try {
                await Subscription.update({ planId, paid_to }, { where: { userInfoId } })
                let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
                let user = await User.findOne({ where: { id: userInfo.userId } })
                let optionsByPlan = await SubscriptionOptionsByPlan.findAll({ where: { planId } })
                optionsByPlan = optionsByPlan.map(el => el.optionId)              
                let options = await SubscriptionOption.findAll({ where: { option_id: { [Op.in]: optionsByPlan }, country: userInfo.country } }) // взяли опции по стране
                if (planId === 2) {
                    await LimitCounter.update({ trial_used: true }, { where: { userInfoId } })
                }
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
                if (planId === 1) {
                    return res.send('Подписка отключена')
                } else if (planId === currentPlan.planId) {
                    return res.send('Подписка продлена')
                } else {
                    return res.send('Подписка офрмлена')
                }
            } catch (e) {
                next(e)
            }
        }
        catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        let subscription
        try {
            let { userInfoId } = req.query
            subscription = await Subscription.findOne({ where: { userInfoId: userInfoId } })
            return res.json(subscription)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new SubscriptionController()