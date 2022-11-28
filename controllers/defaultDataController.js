const { SubscriptionPlan, SubscriptionOptionsByPlan, SubscriptionOption, Equipment, TransportType, TransportLoadCapacity, Translation, TransportSideType, Country } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class DefaultDataController {

    async getData(req, res, next) {
        let data = {
            translation: [],
            equipment_types: [],
            transport_types: [],
            transport_side_types: [],
            transport_load_capacities: [],
            subscripton_plans: [],
            subscripton_options: [],
            subscripton_options_by_plans: [],
            countries: []
        }

        let subscripton_plans = await SubscriptionPlan.findAll()
        let subscripton_options = await SubscriptionOption.findAll()
        let subscripton_options_by_plans = await SubscriptionOptionsByPlan.findAll()
        let translation = await Translation.findAll()
        let equipment_types = await Equipment.findAll()
        let transport_types = await TransportType.findAll()
        let transport_side_types = await TransportSideType.findAll()
        let transport_load_capacities = await TransportLoadCapacity.findAll()
        let countries = await Country.findAll()

        data.subscripton_plans = subscripton_plans
        data.subscripton_options = subscripton_options
        data.subscripton_options_by_plans = subscripton_options_by_plans
        data.translation = translation
        data.equipment_types = equipment_types
        data.transport_types = transport_types
        data.transport_side_types = transport_side_types
        data.transport_load_capacities = transport_load_capacities
        data.countries = countries

        return res.json(data)
    }

}

module.exports = new DefaultDataController()