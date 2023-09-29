const { Order, UserInfo, Point, Offer, NotificationState, PartnerByGroup, OrderByGroup, OrderByPartner, LimitCounter, UserAppState, OrderViewed, TransportByOrder, Transport } = require('../../models/models')
const ApiError = require('../../exceptions/api_error')
const { Op, where } = require("sequelize")
const { transportHandler } = require('../../modules/transportHandler')
const { notificationHandler } = require('../../modules/notificationHandler')
const { filterHandler } = require('../../modules/filterHandler')
const limitService = require('../../service/limit_service')
const mailService = require('../../service/mail_service')
const fs = require('fs')
const point_service = require('../../service/point_service')
const url_service = require('../../service/url_service')
const { sort_service } = require('./sort_service')
const { transport_service } = require('./transport._service')
const { order_service } = require('./order_service')
const { role_service } = require('./role_service')
const { supervisor_id_service } = require('./supervisor_id_service')

const language_service = require('../../service/language_service')


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
            direction_response,
            pointFormData
        } = req.body

        let yandex_url = await url_service.createYandexUrl(pointFormData, type)
        let google_url = await url_service.createGoogleUrl(pointFormData, type)

        try {
            await limitService.check_account_activated(language, userInfoId)
            await limitService.check_subscription(language, userInfoId, order_status)
            try {

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
                    for_partner: for_partner ? for_partner : null,
                    for_group: for_group ? for_group : null,
                    direction_response,
                    yandex_url,
                    google_url
                })

                await point_service.createPoints(pointFormData)



                await limitService.increase(userInfoId)
                await mailService.sendEmailToAdmin(`New ${order_type} in ${city} created at ${process.env.CLIENT_URL}`, 'App notification')
                return res.json(order)
            } catch (e) {
                next(e)
            }
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res, next) {
        try {
            let { userInfoId, carrierId, order_status, isArc, filters } = req.body

            let types
            let load_capacities
            let side_types
            let role = await role_service(userInfoId)

            let orderForPoints
            let orderForPartners
            let points
            let partners


            let { sortDirection, sortColumn, _filters } = sort_service(filters, order_status)
            filters = { ..._filters }

            if (role === 'carrier' || role === 'driver') {
                let arrays = await transport_service(userInfoId, role)
                types = [...arrays.types]
                load_capacities = [...arrays.load_capacities]
                side_types = [...arrays.side_types]
            }

            let { state, previousState, order } = await order_service(userInfoId, carrierId, order_status, role, isArc, sortDirection, sortColumn, types, load_capacities, side_types, filters)

            orderForPoints = order.rows.map(el => el.pointsIntegrationId)
            orderForPartners = order.rows.map(el => el.carrierId)

            points = await Point.findAll({ where: { [Op.and]: [{ orderIntegrationId: { [Op.in]: orderForPoints } }, { time: { [Op.between]: [filters[order_status].timeFrom, filters[order_status].timeTo] } }] } })
            points = points.filter(point => (point.point.toLowerCase().includes(filters[order_status].name.toLowerCase()))).map(point => point.orderIntegrationId)

            let partnersByGroups = await PartnerByGroup.findAll({ where: { partnerGroupId: { [Op.in]: filters.partnersByGroups } } })
            partnersByGroups = partnersByGroups.map(el => el.partnerId)
            partnersByGroups = [...new Set(partnersByGroups)];

            partners = await UserInfo.findAll({ where: { id: { [Op.in]: orderForPartners } } })

            if (partnersByGroups.length !== 0) {
                partners = partners.filter(el => partnersByGroups.includes(el.id))
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

                    let actual_new = state.filter(el => el.order_status === 'new' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))

                    let actual_postponed = state.filter(el => el.order_status === 'postponed' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_canceled = state.filter(el => el.order_status === 'canceled' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_completed = state.filter(el => el.order_status === 'completed' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_in_work = state.filter(el => el.order_status === 'inWork' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    let actual_pattern = state.filter(el => el.order_status === 'pattern' && (((role === 'carrier' || role === 'driver') && el.carrier_arc_status !== 'arc') || (role === 'customer' && el.customer_arc_status !== 'arc')))
                    if (role === 'carrier' || role === 'driver') {
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
                        ids: [],
                        transport: []
                    }

                    totalCountObj.new = actual_new.length
                    totalCountObj.postponed = actual_postponed.length
                    totalCountObj.completed = actual_completed.length
                    totalCountObj.canceled = actual_canceled.length
                    totalCountObj.inWork = actual_in_work.length
                    totalCountObj.arc = actual_arc.length
                    totalCountObj.pattern = actual_pattern.length
                    totalCountObj.ids = state.filter(el => ((el.carrier_arc_status !== 'arc' && (role === 'carrier' || role === 'driver')) || (el.customer_arc_status !== 'arc' && role === 'customer'))).map(el => el.id)
                    totalCountObj.transport = await TransportByOrder.findAll({ where: { orderId: { [Op.in]: totalCountObj.ids } } })
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

            if (order_status === 'new' && (role === 'carrier' || role === 'driver')) {
                order.map_rows = [...order.rows]
            }

            order.filtered_count = order.rows.length

            order.rows = order.rows.splice(0, filters[order_status].limit)

            //get transport

            let transportIdsForObject = await TransportByOrder.findAll({ where: { orderId: { [Op.in]: order.rows.map(el => el.id) } } })

            let transportIds = [...transportIdsForObject.map(el => el.transportId)]

            order.transport = await Transport.findAll({ where: { id: { [Op.in]: transportIds } } })

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
        let { option, order_type, id, role, order_status, order_final_status, carrierId, userInfoId, cost, newTime, firstPointId, transport } = req.body


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

                let order = await Order.findOne({ where: { id }, raw: true })
                let driverUserInfo = await UserInfo.findOne(({ where: { id: order.driver_id }, raw: true }))
                complete_orders_amount = driverUserInfo.complete_orders_amount + 1,
                    await UserInfo.update(
                        {
                            complete_orders_amount
                        },
                        {
                            where: { id: order.driver_id }
                        }
                    )

            }
            else if ((role === 'carrier' || role === 'driver') && order_status === 'inWork') {
                await Offer.destroy({ where: { orderId: id } })
                await TransportByOrder.findOrCreate({ where: { orderId: id, transportId: transport } })
                let transportForDriver = await Transport.findOne({ where: { id: transport } })
                let language = await language_service.setLanguage(userInfoId)
                await limitService.check_account_activated(language, carrierId)
                if (role === 'carrier') {
                    await limitService.check_subscription(language, carrierId, '', 'order')
                }
                if (role === 'driver') {
                    carrierId = await supervisor_id_service(carrierId)
                    await limitService.check_subscription(language, carrierId, '', 'order')
                }
                await Order.update({ order_final_status: order_final_status, order_status: order_status, carrierId: carrierId, cost, newTime, firstPointId, updated_by_role: role, driver_id: transportForDriver.driver_id }, { where: { id: id } }).then(Point.update({ time: newTime }, { where: { id: firstPointId } }))
                await limitService.increase(carrierId, '', 'order')
                await mailService.sendEmailToAdmin(`Order ${id} taken by carrier${role === 'driver' ? '`s driver' : ''} at ${process.env.CLIENT_URL}`, 'App notification')
            }
            else if (role === 'customer' && order_status === 'inWork') {
                await Offer.destroy({ where: { orderId: id } })
                await TransportByOrder.findOrCreate({ where: { orderId: id, transportId: transport } })
                let transportForDriver = await Transport.findOne({ where: { id: transport } })
                await Order.update({ order_final_status: order_final_status, order_status: order_status, carrierId: carrierId, cost, newTime, firstPointId, updated_by_role: role, driver_id: transportForDriver.driver_id }, { where: { id: id } }).then(Point.update({ time: newTime }, { where: { id: firstPointId } }))
                await mailService.sendEmailToAdmin(`Order ${id} taken by customer offer accept at ${process.env.CLIENT_URL}`, 'App notification')
            }

            else if (role === 'carrier' && order_status === 'arc') {
                orderForChanges = await Order.findOne({ where: { id: id } })
                if (orderForChanges.customer_arc_status === 'arc') {
                    await Order.update({ order_final_status: orderForChanges.disrupted_by ? 'disrupt' : order_final_status, order_status: order_status, carrier_arc_status: order_status, updated_by_role: role }, { where: { id: id } }).then(Offer.destroy({ where: { orderId: id } }))
                } else {
                    await Order.update({ carrier_arc_status: order_status, order_final_status: orderForChanges.disrupted_by ? 'disrupt' : order_final_status, updated_by_role: role }, { where: { id: id } })
                }
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
                direction_response,
                pointFormData
            } = req.body

            let yandex_url = await url_service.createYandexUrl(pointFormData, type)
            let google_url = await url_service.createGoogleUrl(pointFormData, type)

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
                    for_partner: for_partner ? for_partner : null,
                    for_group: for_group ? for_group : null,
                    direction_response,
                    yandex_url,
                    google_url
                }, { where: { id } })
            ).then(
                await point_service.createPoints(pointFormData)
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
            let orderForViews
            orderForViews = await Order.findOne({ where: { pointsIntegrationId: pointsIntegrationId } })
            await TransportByOrder.destroy({ where: { orderId: orderForViews.id } })
            await OrderViewed.destroy({ where: { orderId: orderForViews.id } })
            await Offer.destroy({ where: { orderId: orderForViews.id } })
            await Order.destroy({ where: { pointsIntegrationId: pointsIntegrationId } })
            await Point.destroy({ where: { orderIntegrationId: pointsIntegrationId } })
            fs.rmSync(`./uploads/order/${orderForViews.dataValues.id}`, { recursive: true, force: true });
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

}

module.exports = new OrderController()