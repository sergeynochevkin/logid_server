const { SubscriptionPlan, SubscriptionOptionsByPlan, SubscriptionOption, Equipment, TransportType, TransportLoadCapacity, Translation, TransportSideType, Country, UserInfo } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { where } = require('sequelize')

class DefaultDataController {

    async getData(req, res, next) {
        let data = {
            equipment_types: [],
            transport_types: [],
            transport_side_types: [],
            transport_load_capacities: [],
            subscripton_plans: [],
            subscripton_options: [],
            subscripton_options_by_plans: [],
            countries: [],
            cities: []
        }

        let subscripton_plans = await SubscriptionPlan.findAll()
        let subscripton_options = await SubscriptionOption.findAll()
        let subscripton_options_by_plans = await SubscriptionOptionsByPlan.findAll()
        let equipment_types = await Equipment.findAll()
        let transport_types = await TransportType.findAll()
        let transport_side_types = await TransportSideType.findAll()
        let transport_load_capacities = await TransportLoadCapacity.findAll()
        let countries = await Country.findAll()

        let user_infos = await UserInfo.findAll()
        let cities = user_infos.map(el => el.city)
        cities = [...new Set(cities)]

        data.subscripton_plans = subscripton_plans
        data.subscripton_options = subscripton_options
        data.subscripton_options_by_plans = subscripton_options_by_plans
        data.equipment_types = equipment_types
        data.transport_types = transport_types
        data.transport_side_types = transport_side_types
        data.transport_load_capacities = transport_load_capacities
        data.countries = countries
        data.cities = cities

        return res.json(data)
    }

}

module.exports = new DefaultDataController()