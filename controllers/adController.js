const { Op } = require('sequelize')
const ApiError = require('../exceptions/api_error')
const { User, Order } = require('../models/models')

class AdController {


    async getMainCountersData(req, res, next) {


        try {

            //ad_counters logics

            //pattern object put data data to object return object activate it in preloader if !auth and if at main page or activate it at main page with fetcher if !auth?


            let main_count = {
                customers_count: 0,
                carriers_count: 0,
                finished_orders_count: 0
            }

            let users = await User.findAll({
                where: {
                    [Op.or]: [
                        { role: 'carrier' },
                        { role: 'customer' }
                    ],
                    email: { [Op.notIn]: ['sergey.nochevkin@gmail.com', 'sergey.nochevkin@hotmail.com', 'sergey.nochevkin@yandex.com']}
                }
            })
            let customers_count = users.filter(el => el.role === 'customer').length + 112
            let carriers_count = users.filter(el => el.role === 'carrier').length + 150

            let finished_orders = await Order.findAll({ where: { order_status: 'completed' } })
            let finished_orders_count = finished_orders.length + 987

            main_count.customers_count = customers_count
            main_count.carriers_count = carriers_count
            main_count.finished_orders_count = finished_orders_count

            return res.json(main_count)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }


    }
}

module.exports = new AdController()