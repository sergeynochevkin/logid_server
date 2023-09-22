const { Transport, ServerNotification } = require('../../models/models')
const ApiError = require('../../exceptions/api_error')
const { Op } = require("sequelize")

class NotificationController {

    // async create(req, res, next) {
    //     try {
    //         let {
    //             formData
    //         } = req.body
    //         let {
    //         } = formData
    //         let notification = await ServerNotification.create({
    //         })
    //         return res.json(notification)
    //     } catch (e) {
    //         next(ApiError.badRequest(e.message))
    //     }
    // }

    async getAll(req, res, next) {
        try {
            let { userInfoId } = req.query
            let notification;
            notification = await ServerNotification.findAll({ where: { userInfoId } })
            return res.json(notification)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            let { uuid } = req.query
            let notification;
            notification = await ServerNotification.findOne({ where:{ uuid} })
            return res.json(notification)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            let { ids, viewed } = req.body
            let notification;
            notification = await ServerNotification.update({ viewed }, { where: { id: { [Op.in]: ids } } })
            return res.send('updated')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res) {
        try {
            let { id } = req.query
            await ServerNotification.destroy({ where: { id } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('deleted')
    }

    async deleteAll(req, res) {
        try {
            let { ids } = req.query
            await ServerNotification.destroy({ where: { id: { [Op.in]: ids } } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('deleted')
    }
}

module.exports = new NotificationController()