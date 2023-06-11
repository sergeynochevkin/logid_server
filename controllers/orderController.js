const { Order, UserInfo, Point, Offer, NotificationState, PartnerByGroup, OrderByGroup, OrderByPartner, LimitCounter, UserAppState, OrderViewed } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op, where } = require("sequelize")
const { transportHandler } = require('../modules/transportHandler')
const { notificationHandler } = require('../modules/notificationHandler')
const { filterHandler } = require('../modules/filterHandler')
const limitService = require('../service/limit_service')
const mailService = require('../service/mail_service')

class OrderController {

    async create(req, res, next) {
        let {
            language,
            order_comment,
            cost,
            mileage,
            estimated_time,
            carrier,
            order_status,
            order_final_status,
            userId,
            country,
            city,
            type,
            load_capacity,
            side_type,
            thermo_bag,
            hydraulic_platform,
            side_loading,
            glass_stand,
            refrigerator_minus,
            refrigerator_plus,
            thermo_van,
            order_type,
            userInfoId,
            pointsIntegrationId,
            option,
            carrierId,
            previousId,
            for_partner,
            for_group,
            direction_response
        } = req.body

        try {
            await limitService.check_account_activated(language, userInfoId)
            await limitService.check_subscription(language, userInfoId, order_status)
            try {
                let partner = []
                if (for_partner.length !== 0) {
                    partner.push(Number(for_partner))
                    for_partner = JSON.stringify(partner)
                } else {
                    for_partner = JSON.stringify(for_partner)
                }
                let group = []
                if (for_group.length !== 0) {
                    group.push(Number(for_group))
                    for_group = JSON.stringify(group)
                } else {
                    for_group = JSON.stringify(for_group)
                }
                let order = await Order.create({
                    order_comment,
                    cost,
                    mileage,
                    estimated_time,
                    carrier,
                    order_status,
                    order_final_status,
                    userId,
                    country,
                    city,
                    type,
                    load_capacity,
                    side_type,
                    thermo_bag,
                    hydraulic_platform,
                    side_loading,
                    glass_stand,
                    refrigerator_minus,
                    refrigerator_plus,
                    thermo_van,
                    order_type,
                    userInfoId,
                    pointsIntegrationId,
                    carrierId,
                    for_partner,
                    for_group,
                    direction_response
                })
                if (group.length !== 0) {
                    group.forEach(async element => {
                        await OrderByGroup.create({ orderId: order.id, groupId: element })
                    });
                }
                if (partner.length !== 0) {
                    partner.forEach(async element => {
                        await OrderByPartner.create({ orderId: order.id, partnerId: element })
                    });
                }
                await limitService.increase(userInfoId)
                await mailService.sendEmailToAdmin(`New ${order_type} in ${city} created at ${process.env.CLIENT_URL}`, 'App notification')
                return res.json(order)
            } catch (error) {
                next(e)
            }
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res, next) {
        try {
            let { userInfoId, role, carrierId, order_status, country, city, transport, myBlocked, iAmBlocked, myFavorite, isArc, filters } = req.body

            let types
            let load_capacities
            let side_types

            if (role === 'carrier') {
                types = transport.map(el => el.type).filter(el => el !== null)
                load_capacities = transport.map(el => el.load_capacity).filter(el => el !== null)
                side_types = transport.map(el => el.side_type).filter(el => el !== null)
                transportHandler(types, load_capacities, side_types)
            }

            let order =
            {
                count: undefined,
                total_count: {},
                filtered_count: undefined,
                rows: [],
                map_rows: [],
                added: {},
                views: []
            }

            let orderForPoints
            let orderForPartners
            let points
            let partners
            let previousState
            let state

            let sortDirection
            let sortColumn

            if (filters[order_status].selectedSort === '') {
                sortDirection = 'id'
                sortColumn = 'ASC'
            }
            if (filters[order_status].selectedSort === 'default') {
                sortDirection = 'id'
                sortColumn = 'DESC'
            }
            if (filters[order_status].selectedSort === 'auctionFirst') {
                sortDirection = 'order_type'
                sortColumn = 'ASC'
            }
            if (filters[order_status].selectedSort === 'orderFirst') {
                sortDirection = 'order_type'
                sortColumn = 'DESC'
            }
            if (filters[order_status].selectedSort === 'costUp') {
                sortDirection = 'cost'
                sortColumn = 'ASC'
            }
            if (filters[order_status].selectedSort === 'costDown') {
                sortDirection = 'cost'
                sortColumn = 'DESC'
            }
            if (filters[order_status].selectedSort === 'firstCreated') {
                sortDirection = 'createdAt'
                sortColumn = 'DESC'
            }
            if (filters[order_status].selectedSort === 'lastCreated') {
                sortDirection = 'createdAt'
                sortColumn = 'ASC'
            }
            if (filters[order_status].selectedSort === 'finalStatus') {
                sortDirection = 'order_final_status'
                sortColumn = 'ASC'
            }
            if (filters[order_status].selectedSort === 'transportType') {
                sortDirection = 'type'
                sortColumn = 'ASC'
            }

            filters[order_status].costFrom === '' ? filters[order_status].costFrom = 0 : ''
            filters[order_status].costTo === '' ? filters[order_status].costTo = 10000000 : ''
            filters[order_status].timeFrom === '' ? filters[order_status].timeFrom = '1022-08-13 01:59:00+03' : ''
            filters[order_status].timeTo === '' ? filters[order_status].timeTo = '3022-08-13 01:59:00+03' : ''

            if (isArc !== 'arc') {
                previousState = await NotificationState.findOne({ where: { userInfoId: userInfoId } })
                if (previousState.order_state) {
                    previousState = JSON.parse(previousState.order_state)
                } else {
                    previousState = []
                }
            }

            if (role === 'customer' && isArc === 'arc') {
                order = await Order.findAndCountAll({
                    where: {
                        [Op.and]: { userInfoId, customer_arc_status: order_status, cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] } }
                    }, order: [
                        [sortDirection, sortColumn]
                    ],
                    offset: 0,
                    // limit: filters[order_status].limit
                })
            }

            else if (role === 'customer') {
                order = await Order.findAndCountAll({
                    where: { [Op.and]: { userInfoId, order_status, customer_arc_status: null, cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] } } },
                    order: [
                        [sortDirection, sortColumn]
                    ],
                    offset: 0,
                    // limit: filters[order_status].limit
                })

                state = await Order.findAll({
                    where: { [Op.and]: { userInfoId/*,order_status:{[Op.ne]:'arc', customer_arc_status: null*/ } }
                })
            }

            if (role === 'carrier' && isArc === 'arc') {
                order = await Order.findAndCountAll({
                    where: { [Op.and]: { carrierId, carrier_arc_status: order_status, cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] } } },
                    order: [
                        [sortDirection, sortColumn]
                    ],
                    offset: 0,
                    // limit: filters[order_status].limit
                })
            }

            if (role === 'carrier' && isArc !== 'arc') {
                if (order_status !== 'new') {
                    order = await Order.findAndCountAll({
                        where: { [Op.and]: { carrierId, order_status, country, /*city, comment go to geo*/  carrier_arc_status: null, cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] } } },
                        order: [
                            [sortDirection, sortColumn]
                        ],
                        offset: 0,
                        // limit: filters[order_status].limit
                    })
                }

                // города
                let userInfoCity = {
                    lat: '',
                    lng: '',
                    name: ''
                }
                let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
                userInfoCity.lat = parseFloat(userInfo.city_latitude)
                userInfoCity.lng = parseFloat(userInfo.city_longitude)
                userInfoCity.name = userInfo.city

                let cities = []

                state = await UserAppState.findOne({ where: { userInfoId } })
                if (state) {
                    state = JSON.parse(state.state)
                    if (state.user_map_cities) {
                        cities = state.user_map_cities
                        cities.push(userInfoCity)
                    } else {
                        cities.push(userInfoCity)
                    }
                } else {
                    cities.push(userInfoCity)
                }

                let bound = 0.6

                if (order_status === 'new') {
                    let orderFavorite = []
                    for (const city of cities) {
                        let orders = await Order.findAll({
                            where: {
                                [Op.and]: {
                                    carrierId, order_status, country, type: types, load_capacity: load_capacities, side_type: side_types,
                                    userInfoId: { [Op.in]: myFavorite }, carrier_arc_status: null,
                                    start_lat: { [Op.lte]: city.lat + bound },
                                    start_lng: { [Op.lte]: city.lng + bound },
                                    start_lat: { [Op.gte]: city.lat - bound },
                                    start_lng: { [Op.gte]: city.lng - bound },
                                    cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] }
                                }
                            },
                            order: [
                                [sortDirection, sortColumn]
                            ],
                            offset: 0,
                        })
                        orderFavorite = [...orderFavorite, ...orders]
                    }

                    let blocked = [...new Set([...myBlocked, ...iAmBlocked])]

                    let restOrders = []
                    for (const city of cities) {
                        let orders = await Order.findAll({
                            where: {
                                [Op.and]: {
                                    order_status, country, type: types, load_capacity: load_capacities, side_type: side_types,
                                    userInfoId: { [Op.notIn]: blocked }, carrier_arc_status: null,
                                    start_lat: { [Op.lte]: city.lat + bound },
                                    start_lng: { [Op.lte]: city.lng + bound },
                                    start_lat: { [Op.gte]: city.lat - bound },
                                    start_lng: { [Op.gte]: city.lng - bound },
                                    cost: { [Op.between]: [filters[order_status].costFrom, filters[order_status].costTo] }
                                }
                            },
                            order: [
                                [sortDirection, sortColumn]
                            ],
                            offset: 0,
                        })
                        restOrders = [...restOrders, ...orders]
                    }

                    let firtstPointCheckedOrders = [...new Set([...orderFavorite, ...restOrders])]

                    //second variant if intercity on
                    let orderSet = []
                    for (const city of cities) {
                        for (const order of firtstPointCheckedOrders) {
                            if ((order.end_lat < city.lat + bound && order.end_lng < city.lng + bound && order.end_lat > city.lat - bound && order.end_lng > city.lng - bound) && !orderSet.find(el => el.id === order.id)) {
                                if (filters.intercity) {
                                    if ((order.start_lat > order.end_lat && order.start_lng > order.end_lng) && (parseFloat(order.start_lat) - bound > order.end_lat && parseFloat(order.start_lng) - bound > order.end_lng)) {
                                        orderSet.push(order)
                                    }
                                    if ((order.start_lat < order.end_lat && order.start_lng < order.end_lng) && (parseFloat(order.start_lat) + bound < order.end_lat && parseFloat(order.start_lng) + bound < order.end_lng)) {
                                        orderSet.push(order)
                                    }
                                    if ((order.start_lat > order.end_lat && order.start_lng < order.end_lng) && (order.start_lat > parseFloat(order.end_lat) + bound && parseFloat(order.start_lng) + bound < order.end_lng)) {
                                        orderSet.push(order)
                                    }
                                    if ((order.start_lat < order.end_lat && order.start_lng > order.end_lng) && (parseFloat(order.start_lat) + bound < order.end_lat && order.start_lng > parseFloat(order.end_lng) + bound)) {
                                        orderSet.push(order)
                                    }
                                } else {
                                    orderSet.push(order)
                                }
                            }
                        }
                    }


                    order.rows = [...orderSet]

                    let currentRows = []
                    for (const row of order.rows) {
                        let for_partner = await OrderByPartner.findAll({ where: { orderId: row.id } })
                        for_partner = for_partner.map(el => el.partnerId)

                        let for_group = await OrderByGroup.findAll({ where: { orderId: row.id } })
                        for_group = for_group.map(el => el.groupId)

                        let partners = []

                        if (for_partner.length !== 0 || for_group.length !== 0) {
                            let partnersByGroups = []
                            if (for_group.length !== 0) {
                                partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: { [Op.in]: for_group } } })
                                partnersByGroups = partnersByGroups.length > 0 ? partnersByGroups.map(el => el.partnerId) : []
                            }
                            partners = [...partnersByGroups, ...for_partner]
                            partners = [...new Set(partners)];

                            if (partners.includes(userInfoId)) {
                                currentRows.push(row)
                            }
                        }
                        else {
                            currentRows.push(row)
                        }
                    }
                    order.rows = [...currentRows]
                }

                let blockedForState = [...new Set([...myBlocked, ...iAmBlocked])]

                //state with cities in mind              
                let firtstPointCheckedOrders = []
                for (const city of cities) {
                    let orders = await Order.findAll({
                        where: {
                            [Op.and]: {
                                order_status: 'new', carrier_arc_status: null, userInfoId: { [Op.notIn]: blockedForState }, type: types, load_capacity: load_capacities, side_type: side_types,
                                start_lat: { [Op.lte]: city.lat + bound },
                                start_lng: { [Op.lte]: city.lng + bound },
                                start_lat: { [Op.gte]: city.lat - bound },
                                start_lng: { [Op.gte]: city.lng - bound }
                            }
                        }
                    })
                    firtstPointCheckedOrders = [...firtstPointCheckedOrders, ...orders]
                }

                //second variant if intercity on
                let newOrdersState = []
                for (const city of cities) {
                    for (const order of firtstPointCheckedOrders) {
                        if ((order.end_lat < city.lat + bound && order.end_lng < city.lng + bound && order.end_lat > city.lat - bound && order.end_lng > city.lng - bound) && !newOrdersState.find(el => el.id === order.id)) {
                            newOrdersState.push(order)
                        }
                    }
                }


                let currentNewOrdersState = []
                for (const row of newOrdersState) {
                    let for_partner = await OrderByPartner.findAll({ where: { orderId: row.id } })
                    for_partner = for_partner.map(el => el.partnerId)

                    let for_group = await OrderByGroup.findAll({ where: { orderId: row.id } })
                    for_group = for_group.map(el => el.groupId)

                    let partners = []

                    if (for_group.length !== 0 || for_partner.length !== 0) {
                        let partnersByGroups = []
                        if (for_group.length !== 0) {
                            partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: { [Op.in]: for_group } } })
                            partnersByGroups = partnersByGroups.length > 0 ? partnersByGroups.map(el => el.partnerId) : []
                        }
                        partners = [...partnersByGroups, ...for_partner]
                        partners = [...new Set(partners)];

                        if (partners.includes(userInfoId)) {
                            currentNewOrdersState.push(row)
                        }
                    } else {
                        currentNewOrdersState.push(row)
                    }
                }
                // what about the logic of the previous state for the carrier suppose he reconfigured the filter
                newOrdersState = [...currentNewOrdersState]

                state = await Order.findAll({
                    where: {
                        [Op.and]: {
                            carrierId, order_status: { [Op.notIn]: ['new'] },
                            /*order_status:{[Op.ne]:'arc'}carrier_arc_status: null, type: types, load_capacity: load_capacities, side_type: side_types*/
                        }
                    }
                })
                state = [...state, ...newOrdersState]
            }



            orderForPoints = order.rows.map(el => el.pointsIntegrationId)
            orderForPartners = order.rows.map(el => el.carrierId)

            points = await Point.findAll({ where: { [Op.and]: [{ orderIntegrationId: { [Op.in]: orderForPoints } }, { time: { [Op.between]: [filters[order_status].timeFrom, filters[order_status].timeTo] } }] } })
            points = points.filter(point => (point.point.toLowerCase().includes(filters[order_status].name.toLowerCase()))).map(point => point.orderIntegrationId)

            let partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: { [Op.in]: filters.partnersByGroups } } })
            partnersByGroups = partnersByGroups.map(el => el.partnerId)
            partnersByGroups = [...new Set(partnersByGroups)];

            partners = await UserInfo.findAll({ where: { id: { [Op.in]: orderForPartners } } })

            if (partnersByGroups.length !== 0) {
                partners = partners.filter(el => partnersByGroups.includes(el.id))//new logic with groups
            }

            partners = partners.filter(partner => partner.name_surname_fathersname.toLowerCase().includes(filters[order_status].partnerName.toLowerCase())
                || partner.company_name.toLowerCase().includes(filters[order_status].partnerName.toLowerCase()))
                .map(partner => partner.id)

            order.rows = order.rows.filter(order => (((points.includes(order.pointsIntegrationId))
                && ((partners.includes(order.carrierId) || partners.includes(order.userInfoId) || filters[order_status].partnerName.length === 0) && (partnersByGroups.length === 0 || partnersByGroups.includes(order.carrierId) || partnersByGroups.includes(order.userInfoId)))
                && (order.id == filters[order_status].id || filters[order_status].id === '') && (filters.selected.includes(order.id) || filters.selected.length === 0))))

            if (isArc !== 'arc') {
                let actual_arc
                if (previousState.length > 0) {
                    let prev_new = previousState.filter(el => el.order_status === 'new')
                    let prev_postponed = previousState.filter(el => el.order_status === 'postponed')
                    let prev_canceled = previousState.filter(el => el.order_status === 'canceled')
                    let prev_completed = previousState.filter(el => el.order_status === 'completed')
                    let prev_in_work = previousState.filter(el => el.order_status === 'inWork')

                    let actual_new = state.filter(el => el.order_status === 'new' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))

                    let actual_postponed = state.filter(el => el.order_status === 'postponed' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_canceled = state.filter(el => el.order_status === 'canceled' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_completed = state.filter(el => el.order_status === 'completed' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_in_work = state.filter(el => el.order_status === 'inWork' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_pattern = state.filter(el => el.order_status === 'pattern' && ((role === 'carrier' && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    if (role === 'carrier') {
                        actual_arc = state.filter(el => el.carrier_arc_status === 'arc')
                    }
                    if (role === 'customer') {
                        actual_arc = state.filter(el => el.customer_arc_status === 'arc')
                    }

                    let totalCountObj = {
                        new: '',
                        postponed: '',
                        completed: '',
                        canceled: '',
                        inWork: '',
                        arc: '',
                        pattern: '',
                        ids: []
                    }

                    totalCountObj.new = actual_new.length
                    totalCountObj.postponed = actual_postponed.length
                    totalCountObj.completed = actual_completed.length
                    totalCountObj.canceled = actual_canceled.length
                    totalCountObj.inWork = actual_in_work.length
                    totalCountObj.arc = actual_arc.length
                    totalCountObj.pattern = actual_pattern.length
                    totalCountObj.ids = state.filter(el => ((el.carrier_arc_status !== 'arc' && role === 'carrier') || (el.customer_arc_status !== 'arc' && role === 'customer'))).map(el => el.id)
                    order.total_count = totalCountObj

                    let addedObj = {
                        new: [],
                        postponed: [],
                        completed: [],
                        canceled: [],
                        inWork: [],
                        newType: []
                    }

                    let previousOrderState

                    let stateForCompare = state.filter(el => (previousState.map(el => el.id)).includes(el.id))
                    stateForCompare.forEach(element => {
                        previousOrderState = previousState.find(el => el.id === element.id)
                        if (previousOrderState.order_type !== element.order_type) {
                            addedObj.newType.push(element)
                        }
                    });


                    addedObj.new = actual_new.filter(el => !(prev_new.map(el => el.id)).includes(el.id))
                    addedObj.postponed = actual_postponed.filter(el => !(prev_postponed.map(el => el.id)).includes(el.id))
                    addedObj.canceled = actual_canceled.filter(el => !(prev_canceled.map(el => el.id)).includes(el.id))
                    addedObj.completed = actual_completed.filter(el => !(prev_completed.map(el => el.id)).includes(el.id))
                    addedObj.inWork = actual_in_work.filter(el => !(prev_in_work.map(el => el.id)).includes(el.id))

                    order.added = addedObj

                    // push changed ids           
                }

                state = JSON.stringify(state)
                await NotificationState.update({ order_state: state }, { where: { userInfoId: userInfoId } })
            }

            if (order_status === 'new' && role === 'carrier') {
                order.map_rows = [...order.rows]
            }

            order.filtered_count = order.rows.length

            order.rows = order.rows.splice(0, filters[order_status].limit)

            if (order_status === 'new' || order_status === 'postponed') {
                let views = await OrderViewed.findAll({ where: { orderId: order.rows.map(el => el.id) } })
                order.views = views
            }

            return res.json(order)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            let { id } = req.query
            let order;
            order = await Order.findOne({ where: { id } })
            return res.json(order)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        let order
        let complete_orders_amount
        let carrierUserInfo
        let customerUserInfo
        let orderForChanges
        let { option, order_type, id, role, order_status, order_final_status, carrierId, userInfoId, cost, newTime, firstPointId } = req.body




        try {
            if (option === 'restore') {
                await Order.update({ restored: 'restored' }, { where: { id: id } })
            }
            else if (order_type === 'order' || order_type === 'auction') {
                await Order.update({ order_type: order_type }, { where: { id: id } })
            }
            else if (order_status === 'completed') {
                await Order.update({ order_final_status: order_final_status, order_status: order_status, updated_by_role: role }, { where: { id: id } })
                    .then(carrierUserInfo = await UserInfo.findOne(({ where: { id: carrierId } })))
                    .then(customerUserInfo = await UserInfo.findOne(({ where: { id: userInfoId } })))
                    .then(
                        complete_orders_amount = carrierUserInfo.complete_orders_amount + 1,
                        await UserInfo.update(
                            {
                                complete_orders_amount
                            },
                            {
                                where: { id: carrierId }
                            }
                        ))
                    .then(
                        complete_orders_amount = customerUserInfo.complete_orders_amount + 1,
                        await UserInfo.update(
                            {
                                complete_orders_amount
                            },
                            {
                                where: { id: userInfoId }
                            }
                        ))

            }


            else if (role === 'carrier' && order_status === 'inWork') {
                let userInfo = await UserInfo.findOne({ where: { userId: carrierId } })
                let state = await UserAppState.findOne({ where: { userInfoId: userInfo.id } })
                state = JSON.parse(state.dataValues.state)
                let language = state.language

                await limitService.check_account_activated(language, carrierId)
                await limitService.check_subscription(language, carrierId, '', 'order')
                await Order.update({ order_final_status: order_final_status, order_status: order_status, carrierId: carrierId, cost, newTime, firstPointId, updated_by_role: role }, { where: { id: id } }).then(Point.update({ time: newTime }, { where: { id: firstPointId } }))
                await limitService.increase(carrierId, '', 'order')
                await mailService.sendEmailToAdmin(`Order ${id} taken by carrier at ${process.env.CLIENT_URL}`, 'App notification')
            }

            else if (role === 'customer' && order_status === 'inWork') {
                await Order.update({ order_final_status: order_final_status, order_status: order_status, carrierId: carrierId, cost, newTime, firstPointId, updated_by_role: role }, { where: { id: id } }).then(Point.update({ time: newTime }, { where: { id: firstPointId } }))
                await mailService.sendEmailToAdmin(`Order ${id} taken by customer offer accept at ${process.env.CLIENT_URL}`, 'App notification')
            }
            else if (role === 'carrier' && order_status === 'arc') {
                orderForChanges = await Order.findOne({ where: { id: id } })
                if (orderForChanges.customer_arc_status === 'arc') {
                    await Order.update({ order_final_status: orderForChanges.disrupted_by ? 'disrupt' : order_final_status, order_status: order_status, carrier_arc_status: order_status, updated_by_role: role }, { where: { id: id } }).then(Offer.destroy({ where: { orderId: id } }))
                } else {
                    await Order.update({ carrier_arc_status: order_status, order_final_status: orderForChanges.disrupted_by ? 'disrupt' : order_final_status, updated_by_role: role }, { where: { id: id } })
                }
                await OrderByGroup.destroy({ where: { orderId: id } })
                await OrderByPartner.destroy({ where: { orderId: id } })
            }
            else if (role === 'customer' && order_status === 'arc') {
                orderForChanges = await Order.findOne({ where: { id: id } })
                if (orderForChanges.order_status === 'canceled' && orderForChanges.carrier_arc_status !== 'arc') {
                    await Order.update({ order_final_status: orderForChanges.disrupted_by ? 'disrupt' : orderForChanges.order_status, customer_arc_status: order_status, updated_by_role: role }, { where: { id: id } }).then(Offer.destroy({ where: { orderId: id } }))
                } else if (orderForChanges.order_status === 'canceled' && orderForChanges.carrier_arc_status === 'arc') {
                    await Order.update({ order_final_status: orderForChanges.disrupted_by ? 'disrupt' : order_final_status, order_status: order_status, customer_arc_status: order_status, updated_by_role: role }, { where: { id: id } }).then(Offer.destroy({ where: { orderId: id } }))
                } else {
                    await Order.update({ customer_arc_status: order_status, order_final_status: order_final_status, updated_by_role: role }, { where: { id: id } })
                }
                await OrderByGroup.destroy({ where: { orderId: id } })
                await OrderByPartner.destroy({ where: { orderId: id } })
            }
            else if (option === 'disrupt') {
                await Order.update({ order_final_status: order_final_status, order_status: order_status, disrupted_by: role === 'carrier' ? 'customer' : role === 'customer' ? 'carrier' : '', updated_by_role: role }, { where: { id: id } })
                order = await Order.findOne({ where: { id } })
                let disrupter = await UserInfo.findOne({ where: { id: role === 'carrier' ? order.userInfoId : role === 'customer' ? order.carrierId : '' } })
                await UserInfo.update({ disruption_amount: disrupter.disruption_amount + 1 }, { where: { id: disrupter.id } })
            }
            else if (order_status === 'new') {
                await Order.update({ order_final_status: order_final_status, order_status: order_status, updated_by_role: role, disrupted_by: '' }, { where: { id: id } })
            }
            else {
                await Order.update({ order_final_status: order_final_status, order_status: order_status, updated_by_role: role, disrupted_by: '' }, { where: { id: id } })
            }
            return res.send('updated')
        }
        catch (e) {
            next(e)
        }
    }


    async edit(req, res, next) {
        try {
            let order
            let complete_orders_amount
            let carrierUserInfo
            let customerUserInfo
            let orderForChanges
            let {
                id,
                order_comment,
                cost,
                mileage,
                estimated_time,
                carrier,
                order_status,
                order_final_status,
                country,
                city,
                type,
                load_capacity,
                side_type,
                thermo_bag,
                hydraulic_platform,
                side_loading,
                glass_stand,
                refrigerator_minus,
                refrigerator_plus,
                thermo_van,
                order_type,
                pointsIntegrationId,
                files,
                for_partner,
                for_group,
                oldPointsId,
                direction_response
            } = req.body

            await Point.destroy({ where: { orderIntegrationId: oldPointsId } }).then(
                await Order.update({
                    order_comment,
                    cost,
                    mileage,
                    estimated_time,
                    carrier,
                    order_status,
                    order_final_status,
                    country,
                    city,
                    type,
                    load_capacity,
                    side_type,
                    thermo_bag,
                    hydraulic_platform,
                    side_loading,
                    glass_stand,
                    refrigerator_minus,
                    refrigerator_plus,
                    thermo_van,
                    order_type,
                    pointsIntegrationId,
                    files,
                    for_partner,
                    for_group,
                    direction_response
                }, { where: { id } })
            )

            return res.send('edited')

        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async delete(req, res, next) {
        try {
            let { pointsIntegrationId } = req.query
            await Order.destroy({ where: { pointsIntegrationId: pointsIntegrationId } })
            await Point.destroy({ where: { orderIntegrationId: pointsIntegrationId } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('deleted')
    }

    async set_viewed(req, res, next) {
        try {
            //set viewed logics
            let { orderId, userInfoId } = req.body
            await OrderViewed.create({ orderId, userInfoId })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('view has been set')
    }

    async clear_viewed(req, res, next) {
        try {
            //set clear viewed logics
            let { orderId } = req.body
            await OrderViewed.destroy({ where: { orderId } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('views cleared')
    }





    // use to display in the order and disable the delete group button if there are orders that are available to the group
    async getOrderConnections(req, res, next) {
        try {
            let { orderIds, option } = req.body
            let connections;

            if (option === 'partners') {
                connections = await OrderByPartner.findAll({ where: { orderId: { [Op.in]: orderIds } } })
            }
            if (option === 'groups') {
                connections = await OrderByGroup.findAll({ where: { orderId: { [Op.in]: orderIds } } })
            }
            return res.json(connections)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new OrderController()