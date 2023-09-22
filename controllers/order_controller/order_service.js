const { Op } = require("sequelize")
const { NotificationState, Order, UserInfo, UserAppState } = require("../../models/models")
const { country_service } = require("./country_service")
const { partner_service } = require("./partner_service")
const { city_service } = require("./city_service")

const order_service = async function (userInfoId, carrierId, order_status, role, isArc, sortDirection, sortColumn, types, load_capacities, side_types, filters) {

    let country = await country_service(userInfoId)
    let { myBlocked, iAmBlocked, myFavorite } = await partner_service(userInfoId)

    let previousState
    let order =
    {
        count: undefined,
        total_count: {},
        filtered_count: undefined,
        rows: [],
        map_rows: [],
        added: {},
        views: [],
        transport: []
    }
    let state

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

    ///!!!
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

        let bound = 0.6
        let cities = await city_service(userInfoId)

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
                let for_partner = row.for_partner
                let for_group = row.for_group

                let partners = []

                if (for_partner || for_group) {
                    let partnersByGroups = []
                    if (for_group) {
                        partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: for_group } })
                        partnersByGroups = partnersByGroups.length > 0 ? partnersByGroups.map(el => el.partnerId) : []
                    }
                    partners = [...partnersByGroups, for_partner]
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
            let for_partner = row.for_partner
            let for_group = row.for_group

            let partners = []

            if (for_group || for_partner) {
                let partnersByGroups = []
                if (for_group) {
                    partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: for_group } })
                    partnersByGroups = partnersByGroups.length > 0 ? partnersByGroups.map(el => el.partnerId) : []
                }
                partners = [...partnersByGroups, for_partner]
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

    return (
        { order, previousState, state }
    )
}

module.exports = {
    order_service
}