const { Op } = require('sequelize');
const { Translation, SubscriptionPlan, SubscriptionOption, SubscriptionOptionsByPlan, Equipment, TransportLoadCapacity, TransportSideType, TransportType, Country } = require('../models/models')
const translateService = require('../service/translate_service')

module.exports = async function () {
    console.log('default data handler started...');

    // let translation = translateService.translation

    // for (const row of translation) {
    //     let checkItem = await Translation.findOne({ where: { [Op.and]: { service: row.service, type: row.type } } })
    //     if (checkItem) {
    //         Translation.update({ russian: row.russian, english: row.english, spain: row.spain, color: row.color }, { where: { [Op.and]: { service: row.service, type: row.type } } })
    //     } else {
    //         Translation.create({ service: row.service, russian: row.russian, english: row.english, spain: row.spain, color: row.color, type: row.type })
    //     }
    // }

    let options_pattern = [
        { option_id: 1, name: 'orders_within_24_hours', comment: 'countdown_from', value: '', role: 'customer', limit: 6, type: 'order', country: '' },
        { option_id: 2, name: 'auction_offers_in_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 3, type: 'offer', country: '' },
        { option_id: 3, name: 'take_orders_within_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 3, type: 'take_order', country: '' },
        { option_id: 4, name: 'orders_within_24_hours', comment: 'countdown_from', value: '', role: 'customer', limit: 20, type: 'order', country: '' },
        { option_id: 5, name: 'auction_offers_in_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 10, type: 'offer', country: '' },
        { option_id: 6, name: 'take_orders_within_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 10, type: 'take_order', country: '' },
        { option_id: 7, name: 'orders_within_24_hours', comment: 'countdown_from', value: '', role: 'customer', limit: 100, type: 'order', country: '' },
        { option_id: 8, name: 'auction_offers_in_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 50, type: 'offer', country: '' },
        { option_id: 9, name: 'take_orders_within_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 50, type: 'take_order', country: '' },
        { option_id: 10, name: 'orders_in_the_city', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 10, type: 'order_range', country: '' },
        { option_id: 11, name: 'orders_in_the_city', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 20, type: 'order_range', country: '' },
        { option_id: 12, name: 'orders_in_the_country', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 10000, type: 'order_range', country: '' },
        { option_id: 13, name: 'orders_in_the_city', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 0, type: 'order_range', country: '' },
        { option_id: 14, name: 'orders_in_the_country', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 5, type: 'order_range', country: '' },
        { option_id: 15, name: 'orders_in_the_country', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 10, type: 'order_range', country: '' },
        { option_id: 16, name: 'points_in_order', comment: 'points_in_order_description', value: '', role: 'customer', limit: 5, type: 'point_limit', country: '' },
        { option_id: 17, name: 'points_in_order', comment: 'points_in_order_description', value: '', role: 'customer', limit: 10, type: 'point_limit', country: '' },
        { option_id: 18, name: 'points_in_order', comment: 'points_in_order_description', value: '', role: 'customer', limit: 50, type: 'point_limit', country: '' },
    ]

    let plans_pattern = [
        { plan_id: 1, name: 'none', value: 'none', bage: '', comment: '', price: '', country: 'russia', frequency: '', period: 0 },
        { plan_id: 2, name: 'free', value: 'free', bage: '30_days', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 3, name: 'standart', value: 'standart_month', bage: 'month', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 4, name: 'standart', value: 'standart_year', bage: 'year', comment: 'free', price: 0, country: 'russia', frequency: 'year', period: 365, country: '' },
        { plan_id: 5, name: 'professional', value: 'professional_month', bage: 'month', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 6, name: 'professional', value: 'professional_year', bage: 'year', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 365, country: '' },
    ]

    let subscriptions = [
        { plan_id: 1, price: 0, country: 'russia' },
        { plan_id: 2, price: 0, country: 'russia' },
        { plan_id: 3, price: 299, country: 'russia' },
        { plan_id: 4, price: 2899, country: 'russia' },
        { plan_id: 5, price: 599, country: 'russia' },
        { plan_id: 6, price: 5799, country: 'russia' },
        { option_id: 1, limit: 6, country: 'russia' },
        { option_id: 2, limit: 3, country: 'russia' },
        { option_id: 3, limit: 3, country: 'russia' },
        { option_id: 4, limit: 20, country: 'russia' },
        { option_id: 5, limit: 10, country: 'russia' },
        { option_id: 6, limit: 10, country: 'russia' },
        { option_id: 7, limit: 100, country: 'russia' },
        { option_id: 8, limit: 50, country: 'russia' },
        { option_id: 9, limit: 50, country: 'russia' },
        { option_id: 10, limit: 10, country: 'russia' },
        { option_id: 11, limit: 20, country: 'russia' },
        { option_id: 12, limit: 10000, country: 'russia' },
        { option_id: 13, limit: 0, country: 'russia' },
        { option_id: 14, limit: 5, country: 'russia' },
        { option_id: 15, limit: 10, country: 'russia' },
        { option_id: 16, limit: 5, country: 'russia' },
        { option_id: 17, limit: 10, country: 'russia' },
        { option_id: 18, limit: 50, country: 'russia' },
        { plan_id: 1, price: 0, country: 'canada' },
        { plan_id: 2, price: 0, country: 'canada' },
        { plan_id: 3, price: 10, country: 'canada' },
        { plan_id: 4, price: 99, country: 'canada' },
        { plan_id: 5, price: 19, country: 'canada' },
        { plan_id: 6, price: 199, country: 'canada' },
        { option_id: 1, limit: 6, country: 'canada' },
        { option_id: 2, limit: 3, country: 'canada' },
        { option_id: 3, limit: 3, country: 'canada' },
        { option_id: 4, limit: 20, country: 'canada' },
        { option_id: 5, limit: 10, country: 'canada' },
        { option_id: 6, limit: 10, country: 'canada' },
        { option_id: 7, limit: 100, country: 'canada' },
        { option_id: 8, limit: 50, country: 'canada' },
        { option_id: 9, limit: 50, country: 'canada' },
        { option_id: 10, limit: 10, country: 'canada' },
        { option_id: 11, limit: 20, country: 'canada' },
        { option_id: 12, limit: 10000, country: 'canada' },
        { option_id: 13, limit: 0, country: 'canada' },
        { option_id: 14, limit: 5, country: 'canada' },
        { option_id: 15, limit: 10, country: 'canada' },
        { option_id: 16, limit: 5, country: 'canada' },
        { option_id: 17, limit: 10, country: 'canada' },
        { option_id: 18, limit: 50, country: 'canada' }
    ]

    let plans = []
    let options = []

    for (const option of options_pattern) {
        let temp_options = subscriptions.filter(el => el.option_id === option.option_id)
        for (const temp_option of temp_options) {
            let item = { ...option, limit: temp_option.limit, country: temp_option.country }
            options.push(item)
        }
    }

    for (const plan of plans_pattern) {
        let temp_plans = subscriptions.filter(el => el.plan_id === plan.plan_id)
        for (const temp_plan of temp_plans) {
            let item = { ...plan, price: temp_plan.price, country: temp_plan.country }
            plans.push(item)
        }
    }

    for (const row of plans) {
        let checkItem = await SubscriptionPlan.findOne({ where: { [Op.and]: { plan_id: row.plan_id, country: row.country } } })
        if (checkItem) {
            await SubscriptionPlan.update({ name: row.name, value: row.value, bage: row.bage, comment: row.comment, country: row.country, frequency: row.frequency, period: row.period, price: row.price }, { where: { [Op.and]: { plan_id: row.plan_id, country: row.country } } })
        } else {
            await SubscriptionPlan.create({ plan_id: row.plan_id, name: row.name, value: row.value, bage: row.bage, comment: row.comment, country: row.country, frequency: row.frequency, period: row.period, price: row.price, country: row.country })
        }
    }
    for (const row of options) {
        let checkItem = await SubscriptionOption.findOne({ where: { [Op.and]: { option_id: row.option_id, country: row.country } } })
        if (checkItem) {
            await SubscriptionOption.update({ name: row.name, comment: row.comment, value: row.value, role: row.role, limit: row.limit, type: row.type }, { where: { [Op.and]: { option_id: row.option_id, country: row.country } } })
        } else {
            await SubscriptionOption.create({ option_id: row.option_id, name: row.name, comment: row.comment, value: row.value, role: row.role, limit: row.limit, type: row.type, country: row.country })
        }
    }

    let options_by_plans = [

        //without
        { planId: 1, optionId: 1, },
        { planId: 1, optionId: 2 },
        { planId: 1, optionId: 3 },
        { planId: 1, optionId: 10 },
        { planId: 1, optionId: 13 },
        { planId: 1, optionId: 16 },

        //free
        { planId: 2, optionId: 4, },
        { planId: 2, optionId: 5 },
        { planId: 2, optionId: 6 },
        { planId: 2, optionId: 11 },
        { planId: 2, optionId: 14 },
        { planId: 2, optionId: 17 },

        //standart
        { planId: 3, optionId: 4, },
        { planId: 3, optionId: 5 },
        { planId: 3, optionId: 6 },
        { planId: 3, optionId: 11 },
        { planId: 3, optionId: 14 },
        { planId: 3, optionId: 17 },

        //standart
        { planId: 4, optionId: 4, },
        { planId: 4, optionId: 5 },
        { planId: 4, optionId: 6 },
        { planId: 4, optionId: 11 },
        { planId: 4, optionId: 14 },
        { planId: 4, optionId: 17 },

        //prof
        { planId: 5, optionId: 7, },
        { planId: 5, optionId: 8 },
        { planId: 5, optionId: 9 },
        { planId: 5, optionId: 12 },
        { planId: 5, optionId: 15 },
        { planId: 5, optionId: 18 },

        //prof
        { planId: 6, optionId: 7, },
        { planId: 6, optionId: 8 },
        { planId: 6, optionId: 9 },
        { planId: 6, optionId: 12 },
        { planId: 6, optionId: 15 },
        { planId: 6, optionId: 18 },
    ]

    for (const row of options_by_plans) {
        await SubscriptionOptionsByPlan.findOrCreate({
            where: {
                planId: row.planId, optionId: row.optionId
            }
        })
    }

    equipment_types = [
        { id: 1, type: 'thermo_bag', name: 'Термо сумка' },
        { id: 2, type: 'thermo_van', name: 'Изотермический фургон' },
        { id: 3, type: 'refrigerator_minus', name: 'Рефрежиратор -7' },
        { id: 4, type: 'refrigerator_plus', name: 'Рефрежиратор +7' },
        { id: 5, type: 'hydraulic_platform', name: 'Гидравлическая платформа' },
        { id: 6, type: 'side_loading', name: 'Боковая загрузка' },
        { id: 7, type: 'glass_stand', name: 'Стойка для стекол' }
    ]

    for (const row of equipment_types) {
        await Equipment.findOrCreate({
            where: {
                type: row.type, name: row.name
            }
        })
    }

    transport_types = [
        { id: 1, type: 'walk', name: 'Пешком' },
        { id: 2, type: 'bike', name: 'Велосипед' },
        { id: 3, type: 'electric_scooter', name: 'Электросамокат' },
        { id: 4, type: 'scooter', name: 'Скутер' },
        { id: 5, type: 'car', name: 'Легковой автомобиль' },
        { id: 6, type: 'combi', name: 'Комби' },
        { id: 7, type: 'minibus', name: 'Микроавтобус' },
        { id: 8, type: 'truck', name: 'Грузовой автомобиль' }
    ]

    for (const row of transport_types) {
        await TransportType.findOrCreate({
            where: {
                type: row.type, name: row.name
            }
        })
    }

    transport_side_types = [
        { id: 1, type: 'open_side', name: 'Открытый борт' },
        { id: 2, type: 'awing', name: 'Тент' },
        { id: 3, type: 'hard_top', name: 'Фургон' }
    ]

    for (const row of transport_side_types) {
        await TransportSideType.findOrCreate({
            where: {
                type: row.type, name: row.name
            }
        })
    }

    transport_load_capacities = [
        { id: 1, capacity: '1.5', name: '1.5 тонны' },
        { id: 2, capacity: '3', name: '3 тонны' },
        { id: 3, capacity: '5', name: '5 тонн' },
        { id: 4, capacity: '10', name: '10 тонн' },
        { id: 5, capacity: '20', name: '20 тонн' }
    ]

    for (const row of transport_load_capacities) {
        await TransportLoadCapacity.findOrCreate({
            where: {
                capacity: row.capacity, name: row.name
            }
        })
    }

    countries = [
        { value: 'russia', country_code_iso3: 'RUS', default_language: 'russian', google_code: 'RU', currency: 'RUR', google_language: 'ru', weight: 'tonn', distance: 'kilometer' },
        { value: 'greece', country_code_iso3: 'GRC', default_language: 'english', google_code: 'GR', currency: 'EUR', google_language: 'el', weight: 'tonn', distance: 'kilometer' },
        { value: 'canada', country_code_iso3: 'CAN', default_language: 'english', google_code: 'CA', currency: 'CAD', google_language: 'en', weight: 'pound', distance: 'mile' },
        { value: 'spain', country_code_iso3: 'ESP', default_language: 'english', google_code: 'ES', currency: 'EUR', google_language: 'es', weight: 'tonn', distance: 'kilometer' },
        { value: 'sweden', country_code_iso3: 'SWE', default_language: 'english', google_code: 'SE', currency: 'EUR', google_language: 'sv', weight: 'tonn', distance: 'kilometer' },
        { value: 'finland', country_code_iso3: 'FIN', default_language: 'english', google_code: 'FI', currency: 'EUR', google_language: 'fi', weight: 'tonn', distance: 'kilometer' },
    ]

    for (const row of countries) {
        let checkItem = await Country.findOne({ where: { value: row.value } })
        if (checkItem) {
            await Country.update({ default_language: row.default_language, google_code: row.google_code, currency: row.currency, weight: row.weight, distance: row.distance }, { where: { value: row.value }, country_code_iso3: row.country_code_iso3 })
        } else {
            await Country.create({ value: row.value, default_language: row.default_language, google_code: row.google_code, currency: row.currency, weight: row.weight, distance: row.distance, country_code_iso3: row.country_code_iso3 })
        }
    }

    console.log('default data overwritted!');
}















