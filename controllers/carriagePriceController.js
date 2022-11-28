const { CarriagePrice } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class CarriagePriceController {
    async create(req, res) {
        const {
            price_per_km,
            carry_in,
            carry_out,
            waiting,
            city
        } = req.body
        const carriage_price = await CarriagePrice.create({
            price_per_km,
            carry_in,
            carry_out,
            waiting,
            city
        })
        return res.json(carriage_price)
    }

    async getAll(req, res) {
        const carriage_price = await CarriagePrice.findAll()
        return res.json(carriage_price)
    }

    async getOne(req, res) {

    }

    async update(req, res) {

    }

    async delete(req, res) {

    }
}

module.exports = new CarriagePriceController()


