const { Subscription, SubscriptionOptionsByPlan, SubscriptionOption, User, UserInfo, LimitCounter, SubscriptionPlan, UserAppLimit, Invoice } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require('sequelize')
const limitService = require('../service/limit_service')
const translateService = require('../service/translate_service')
const paymentService = require('../service/payment_service')


class SubscriptionController {


    async update(req, res, next) {
        let { language, userInfoId, planId, paid_to, payment_id } = req.body
        let currentTime = new Date()
        
        try {

            if (!payment_id) {
                await limitService.check_trial_used(language, userInfoId, planId)
            }

            if (payment_id) {
                let body = await Invoice.findOne({ where: { payment_id } })
                
                let order_details = JSON.parse(body.dataValues.order_details)
                userInfoId = order_details.userInfoId
                console.log(`USER!! ${userInfoId}`);
                planId = order_details.planId
                paid_to = order_details.paid_to
            }

            let currentPlan = await Subscription.findOne({ where: { userInfoId } })

            try {
                let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
                let plan = await SubscriptionPlan.findOne({ where: { country: userInfo.country, plan_id: planId } })

                let price = plan.price
                let status = 'new'
                let type = 'subscription'

                let res_object = {
                    message: '',
                    token: '',
                    payment_id: '',
                    invoice_id: undefined
                }
                //if not trial!!!

                //payment logics

                if (planId !== 1 && planId !== 2 && userInfo.country === 'russia' && !payment_id) {
                    let invoice = await Invoice.create({ userInfoId, type, price, status, order_details: JSON.stringify(req.body) }) // create if not paid if paid update!
                    res_object.invoice_id = invoice.id
                    let payment = await paymentService.createPayment(price, invoice)
                    res_object.token = payment.confirmation.confirmation_token
                    res_object.payment_id = payment.id
                    res_object.message = translateService.setNativeTranslate(language,
                        {
                            russian: ['Пожалуйста, оплатите подписку'],
                            english: ['Pay for a subscription please']
                        }
                    )
                    return res.json(res_object)

                } else {

                    await Invoice.update({ status: 'paid' }, { where: { payment_id } })

                    //if paid, or trial

                    await Subscription.update({ planId, paid_to }, { where: { userInfoId } })

                    let user = await User.findOne({ where: { id: userInfo.userId } })
                    let optionsByPlan = await SubscriptionOptionsByPlan.findAll({ where: { planId } })
                    optionsByPlan = optionsByPlan.map(el => el.optionId)
                    let options = await SubscriptionOption.findAll({ where: { option_id: { [Op.in]: optionsByPlan }, country: userInfo.country } }) // Took options by country
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
                        res_object.message = translateService.setNativeTranslate(language,
                            {
                                russian: ['Подписка отключена'],
                                english: ['Subscription disabled']
                            }
                        )
                        return res.json(res_object)
                    } else if (planId === currentPlan.planId) {
                        res_object.message = translateService.setNativeTranslate(language,
                            {
                                russian: ['Подписка продлена'],
                                english: ['Subscription renewed']
                            }
                        )
                        return res.json(res_object)
                    } else {
                        res_object.message = translateService.setNativeTranslate(language,
                            {
                                russian: ['Подписка оформлена'],
                                english: ['Subscribed']
                            }
                        )
                        return res.json(res_object)
                    }
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