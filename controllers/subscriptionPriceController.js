const { SubscriptionPrice } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class SubscriptionPriceController {
    async create(req, res) {
        const {
            price_1,
            price_3,
            price_6,
            price_12,
            free_trial,
            city
        } = req.body
        const subscription_price = await SubscriptionPrice.create({
            price_1,
            price_3,
            price_6,
            price_12,
            free_trial,
            city
        })
        return res.json(subscription_price)
    }

    async getAll(req, res) {
        const subscription_price = await SubscriptionPrice.findAll()
        return res.json(subscription_price)
    }
}

module.exports = new SubscriptionPriceController()