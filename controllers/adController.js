const { Op, where } = require('sequelize')
const ApiError = require('../exceptions/api_error')
const { User, Order, Transport, UserInfo, Visit, TransportViewed } = require('../models/models')
const { defaults } = require('pg')

class AdController {

    async addView(req, res, next) {
        try {
            let { option, item_id, ip } = req.body
            if (option === 'transport') {
                await TransportViewed.findOrCreate({ where: { transportId: item_id, ip } })
            }

            return res.send('viewed')
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async addContactView(req, res, next) {
        try {
            let { option, item_id, ip, id } = req.body
            if (option === 'transport') {
                await TransportViewed.findOrCreate({ where: { transportId: item_id, userInfoId: id }, defaults: { contact_viewed: true } })

                let view = await TransportViewed.findOne({ where: { ip } })
                if (!view) {
                    await TransportViewed.findOrCreate({ where: { transportId: item_id, ip } })
                }
            }

            return res.send('contact viewed')
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async addVisit(req, res, next) {
        try {
            let { ip } = req.body
            Visit.create({ ip })
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

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
                    email: { [Op.notIn]: ['sergey.nochevkin@gmail.com', 'sergey.nochevkin@hotmail.com', 'sergey.nochevkin@yandex.com', 'sergey.nochevkin@outlook.com'] }
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


    async getTransports(req, res, next) {
        try {
            let { filters, option } = req.body

            // let sortDirection
            // let sortColumn

            // if (filters.selectedSort === '') {
            //     sortDirection = 'id'
            //     sortColumn = 'ASC'
            // }
            // if (filters[order_status].selectedSort === 'default') {
            //     sortDirection = 'id'
            //     sortColumn = 'DESC'
            // }
            // if (filters[order_status].selectedSort === 'auctionFirst') {
            //     sortDirection = 'order_type'
            //     sortColumn = 'ASC'
            // }
            // if (filters[order_status].selectedSort === 'orderFirst') {
            //     sortDirection = 'order_type'
            //     sortColumn = 'DESC'
            // }
            // if (filters[order_status].selectedSort === 'costUp') {
            //     sortDirection = 'cost'
            //     sortColumn = 'ASC'
            // }
            // if (filters[order_status].selectedSort === 'costDown') {
            //     sortDirection = 'cost'
            //     sortColumn = 'DESC'
            // }
            // if (filters[order_status].selectedSort === 'firstCreated') {
            //     sortDirection = 'createdAt'
            //     sortColumn = 'DESC'
            // }
            // if (filters[order_status].selectedSort === 'lastCreated') {
            //     sortDirection = 'createdAt'
            //     sortColumn = 'ASC'
            // }
            // if (filters[order_status].selectedSort === 'finalStatus') {
            //     sortDirection = 'order_final_status'
            //     sortColumn = 'ASC'
            // }
            // if (filters[order_status].selectedSort === 'transportType') {
            //     sortDirection = 'type'
            //     sortColumn = 'ASC'
            // }
            let resObject = {
                rows: [],
                users: []
            }



            let transports
            if (option !== 'main') {
                //search logics
                if (filters.transports.city && filters.transports.city !== 'All' && filters.transports.city !== 'Все') {
                    let user_infos
                    user_infos = await UserInfo.findAll({
                        where: {
                            city: filters.transports.city
                        }
                    })
                    user_infos = user_infos.map(el => el.id)
                    transports = await Transport.findAll({
                        where: {
                            moderated: 'checked_accepted', ad_show: true, ad_text: { [Op.ne]: null }, files: { [Op.ne]: null },
                            type: filters.transports.type !== '' ? filters.transports.type : { [Op.ne]: 'all' },
                            load_capacity: filters.transports.load_capacity !== '' ? filters.transports.load_capacity : { [Op.ne]: 'all' },
                            side_type: filters.transports.side_type !== '' ? filters.transports.side_type : { [Op.ne]: 'all' },
                            refrigerator_minus: filters.transports.refrigerator_minus ? filters.transports.refrigerator_minus : { [Op.in]: [false, true] },
                            refrigerator_plus: filters.transports.refrigerator_plus ? filters.transports.refrigerator_plus : { [Op.in]: [false, true] },
                            thermo_van: filters.transports.thermo_van ? filters.transports.thermo_van : { [Op.in]: [false, true] },
                            thermo_bag: filters.transports.thermo_bag ? filters.transports.thermo_bag : { [Op.in]: [false, true] },
                            side_loading: filters.transports.side_loading ? filters.transports.side_loading : { [Op.in]: [false, true] },
                            glass_stand: filters.transports.glass_stand ? filters.transports.glass_stand : { [Op.in]: [false, true] },
                            hydraulic_platform: filters.transports.hydraulic_platform ? filters.transports.hydraulic_platform : { [Op.in]: [false, true] },
                            [Op.or]: [{ ad_text: { [Op.iLike]: filters.transports.searchString.length > 0 ? `%${filters.transports.transports.searchString}%` : '%%' } }, , { ad_name: { [Op.iLike]: filters.transports.searchString.length > 0 ? `%${filters.transports.searchString}%` : '%%' } }],
                            userInfoId: { [Op.in]: user_infos }
                        },
                        offset: 0,
                        limit: filters.transports.limit
                    })
                } else {
                    transports = await Transport.findAll({
                        where: {
                            moderated: 'checked_accepted', ad_show: true, ad_text: { [Op.ne]: null }, files: { [Op.ne]: null },
                            type: filters.transports.type !== '' ? filters.transports.type : { [Op.ne]: 'all' },
                            load_capacity: filters.transports.load_capacity !== '' ? filters.transports.load_capacity : { [Op.ne]: 'all' },
                            side_type: filters.transports.side_type !== '' ? filters.transports.side_type : { [Op.ne]: 'all' },
                            refrigerator_minus: filters.transports.refrigerator_minus ? filters.transports.refrigerator_minus : { [Op.in]: [false, true] },
                            refrigerator_plus: filters.transports.refrigerator_plus ? filters.transports.refrigerator_plus : { [Op.in]: [false, true] },
                            thermo_van: filters.transports.thermo_van ? filters.transports.thermo_van : { [Op.in]: [false, true] },
                            thermo_bag: filters.transports.thermo_bag ? filters.transports.thermo_bag : { [Op.in]: [false, true] },
                            side_loading: filters.transports.side_loading ? filters.transports.side_loading : { [Op.in]: [false, true] },
                            glass_stand: filters.transports.glass_stand ? filters.transports.glass_stand : { [Op.in]: [false, true] },
                            hydraulic_platform: filters.transports.hydraulic_platform ? filters.transports.hydraulic_platform : { [Op.in]: [false, true] },
                            [Op.or]: [{ ad_text: { [Op.iLike]: filters.transports.searchString.length > 0 ? `%${filters.transports.searchString}%` : '%%' } }, , { ad_name: { [Op.iLike]: filters.transports.searchString.length > 0 ? `%${filters.transports.searchString}%` : '%%' } }]
                        },
                        offset: 0,
                        limit: filters.transports.limit
                    })
                }
            } else {
                let i = 0
                let indexArray = []
                transports = []
                let all_transport = await Transport.findAll({ raw: true, where: { moderated: 'checked_accepted', ad_show: true, ad_text: { [Op.ne]: null }, files: { [Op.ne]: null } } })
                let length = filters.transports.main_limit
                for (; i < length + 10; i++) {
                    let index = Math.floor(Math.random() * all_transport.length);
                    if (!indexArray.includes(index)) {
                        indexArray.push(index)
                        if (indexArray.length === length) {
                            break
                        }
                    }
                }
                for (const index of indexArray) {
                    transports.push(all_transport[index])
                }
                // console.log(transports);
            }
            let users = []
            let currentTime = new Date()
            let dayStart = currentTime.setHours(0, 0, 0, 0)
            for (const transport of transports) {
                let userObject = {
                    transport_id: '',
                    name: '',
                    phone: '',
                    city: '',
                    viewed: 0,
                    viewed_today: 0,
                    contact_viewed: 0,
                    contact_viewed_today: 0
                }
                let userInfo = await UserInfo.findOne({ where: { id: transport.userInfoId } })
                let views = await TransportViewed.findAll({ where: { transportId: transport.id, contact_viewed: false } })
                let contact_views = await TransportViewed.findAll({ where: { transportId: transport.id, contact_viewed: true } })
                let views_today
                let contact_views_today
                if (views) {
                    views_today = views.filter(el => el.createdAt > dayStart)
                }
                if (contact_views) {
                    contact_views_today = contact_views.filter(el => el.createdAt > dayStart)
                }
                userObject.transport_id = transport.id
                userObject.name = transport.ad_name ? transport.ad_name : userInfo.dataValues.legal === 'person' ? userInfo.dataValues.name_surname_fathersname : userInfo.dataValues.company_name
                userObject.name = userObject.name.trim()
                userObject.phone = userInfo.dataValues.phone
                userObject.city = userInfo.dataValues.city
                if (views) { userObject.viewed = views.length }
                if (views_today) { userObject.viewed_today = views_today.length }
                if (contact_views) { userObject.contact_viewed = contact_views.length }
                if (contact_views_today) { userObject.contact_viewed_today = contact_views_today.length }
                // and i need today
                users.push(userObject)
            }
            resObject.rows = [...transports]
            resObject.users = [...users]
            return res.json(resObject)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new AdController()