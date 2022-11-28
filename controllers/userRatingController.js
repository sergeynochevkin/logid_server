const { UserRaiting } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class UserRatingController {
    async create(req, res) {
        const {
            rating,
            userInfoId,
            userId
        } = req.body
        const user_rating = await UserRaiting.create({
            rating,
            userInfoId,
            userId
        })
        return res.json(user_rating)
    }

    async getAll(req, res) {
        const user_rating = await UserRaiting.findAll()
        return res.json(user_rating)
    }
    async getOne(req, res) {

    }

    async update(req, res) {

    }

    async delete(req, res) {

    }
}

module.exports = new UserRatingController()