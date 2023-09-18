const { Op } = require('sequelize');
const { Translation, SubscriptionPlan, SubscriptionOption, SubscriptionOptionsByPlan, Equipment, TransportLoadCapacity, TransportSideType, TransportType, Country, UserInfo, UserAppSetting, Transport, User } = require('../models/models')

module.exports = async function () {
    console.log('default data handler started...');

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
        { plan_id: 1, name: 'none', value: 'none', bage: 'no_time_limit', comment: '', price: '', country: 'russia', frequency: '', period: 0 },
        { plan_id: 2, name: 'free', value: 'free', bage: '30_days', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 3, name: 'standart', value: 'standart_month', bage: 'month', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 4, name: 'standart', value: 'standart_year', bage: 'year', comment: 'free', price: 0, country: 'russia', frequency: 'year', period: 365, country: '' },
        { plan_id: 5, name: 'professional', value: 'professional_month', bage: 'month', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 31, country: '' },
        { plan_id: 6, name: 'professional', value: 'professional_year', bage: 'year', comment: 'free', price: 0, country: 'russia', frequency: 'month', period: 365, country: '' },
    ]

    let subscriptions = [
        { plan_id: 1, price: 0, country: 'russia' },
        { plan_id: 2, price: 0, country: 'russia' },
        { plan_id: 3, price: 300, country: 'russia' },
        { plan_id: 4, price: 3000, country: 'russia' },
        { plan_id: 5, price: 600, country: 'russia' },
        { plan_id: 6, price: 6000, country: 'russia' },
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
        { option_id: 18, limit: 50, country: 'canada' },

        { plan_id: 1, price: 0, country: 'belarus' },
        { plan_id: 2, price: 0, country: 'belarus' },
        { plan_id: 3, price: 10, country: 'belarus' },
        { plan_id: 4, price: 99, country: 'belarus' },
        { plan_id: 5, price: 19, country: 'belarus' },
        { plan_id: 6, price: 199, country: 'belarus' },
        { option_id: 1, limit: 6, country: 'belarus' },
        { option_id: 2, limit: 3, country: 'belarus' },
        { option_id: 3, limit: 3, country: 'belarus' },
        { option_id: 4, limit: 20, country: 'belarus' },
        { option_id: 5, limit: 10, country: 'belarus' },
        { option_id: 6, limit: 10, country: 'belarus' },
        { option_id: 7, limit: 100, country: 'belarus' },
        { option_id: 8, limit: 50, country: 'belarus' },
        { option_id: 9, limit: 50, country: 'belarus' },
        { option_id: 10, limit: 10, country: 'belarus' },
        { option_id: 11, limit: 20, country: 'belarus' },
        { option_id: 12, limit: 10000, country: 'belarus' },
        { option_id: 13, limit: 0, country: 'belarus' },
        { option_id: 14, limit: 5, country: 'belarus' },
        { option_id: 15, limit: 10, country: 'belarus' },
        { option_id: 16, limit: 5, country: 'belarus' },
        { option_id: 17, limit: 10, country: 'belarus' },
        { option_id: 18, limit: 50, country: 'belarus' },

        { plan_id: 1, price: 0, country: 'usa' },
        { plan_id: 2, price: 0, country: 'usa' },
        { plan_id: 3, price: 4, country: 'usa' },
        { plan_id: 4, price: 40, country: 'usa' },
        { plan_id: 5, price: 8, country: 'usa' },
        { plan_id: 6, price: 80, country: 'usa' },
        { option_id: 1, limit: 6, country: 'usa' },
        { option_id: 2, limit: 3, country: 'usa' },
        { option_id: 3, limit: 3, country: 'usa' },
        { option_id: 4, limit: 20, country: 'usa' },
        { option_id: 5, limit: 10, country: 'usa' },
        { option_id: 6, limit: 10, country: 'usa' },
        { option_id: 7, limit: 100, country: 'usa' },
        { option_id: 8, limit: 50, country: 'usa' },
        { option_id: 9, limit: 50, country: 'usa' },
        { option_id: 10, limit: 10, country: 'usa' },
        { option_id: 11, limit: 20, country: 'usa' },
        { option_id: 12, limit: 10000, country: 'usa' },
        { option_id: 13, limit: 0, country: 'usa' },
        { option_id: 14, limit: 5, country: 'usa' },
        { option_id: 15, limit: 10, country: 'usa' },
        { option_id: 16, limit: 5, country: 'usa' },
        { option_id: 17, limit: 10, country: 'usa' },
        { option_id: 18, limit: 50, country: 'usa' },

        { plan_id: 1, price: 0, country: 'united_kingdom' },
        { plan_id: 2, price: 0, country: 'united_kingdom' },
        { plan_id: 3, price: 4, country: 'united_kingdom' },
        { plan_id: 4, price: 40, country: 'united_kingdom' },
        { plan_id: 5, price: 8, country: 'united_kingdom' },
        { plan_id: 6, price: 80, country: 'united_kingdom' },
        { option_id: 1, limit: 6, country: 'united_kingdom' },
        { option_id: 2, limit: 3, country: 'united_kingdom' },
        { option_id: 3, limit: 3, country: 'united_kingdom' },
        { option_id: 4, limit: 20, country: 'united_kingdom' },
        { option_id: 5, limit: 10, country: 'united_kingdom' },
        { option_id: 6, limit: 10, country: 'united_kingdom' },
        { option_id: 7, limit: 100, country: 'united_kingdom' },
        { option_id: 8, limit: 50, country: 'united_kingdom' },
        { option_id: 9, limit: 50, country: 'united_kingdom' },
        { option_id: 10, limit: 10, country: 'united_kingdom' },
        { option_id: 11, limit: 20, country: 'united_kingdom' },
        { option_id: 12, limit: 10000, country: 'united_kingdom' },
        { option_id: 13, limit: 0, country: 'united_kingdom' },
        { option_id: 14, limit: 5, country: 'united_kingdom' },
        { option_id: 15, limit: 10, country: 'united_kingdom' },
        { option_id: 16, limit: 5, country: 'united_kingdom' },
        { option_id: 17, limit: 10, country: 'united_kingdom' },
        { option_id: 18, limit: 50, country: 'united_kingdom' },

        { plan_id: 1, price: 0, country: 'australia' },
        { plan_id: 2, price: 0, country: 'australia' },
        { plan_id: 3, price: 6, country: 'australia' },
        { plan_id: 4, price: 60, country: 'australia' },
        { plan_id: 5, price: 12, country: 'australia' },
        { plan_id: 6, price: 120, country: 'australia' },
        { option_id: 1, limit: 6, country: 'australia' },
        { option_id: 2, limit: 3, country: 'australia' },
        { option_id: 3, limit: 3, country: 'australia' },
        { option_id: 4, limit: 20, country: 'australia' },
        { option_id: 5, limit: 10, country: 'australia' },
        { option_id: 6, limit: 10, country: 'australia' },
        { option_id: 7, limit: 100, country: 'australia' },
        { option_id: 8, limit: 50, country: 'australia' },
        { option_id: 9, limit: 50, country: 'australia' },
        { option_id: 10, limit: 10, country: 'australia' },
        { option_id: 11, limit: 20, country: 'australia' },
        { option_id: 12, limit: 10000, country: 'australia' },
        { option_id: 13, limit: 0, country: 'australia' },
        { option_id: 14, limit: 5, country: 'australia' },
        { option_id: 15, limit: 10, country: 'australia' },
        { option_id: 16, limit: 5, country: 'australia' },
        { option_id: 17, limit: 10, country: 'australia' },
        { option_id: 18, limit: 50, country: 'australia' },

        { plan_id: 1, price: 0, country: 'new_zeland' },
        { plan_id: 2, price: 0, country: 'new_zeland' },
        { plan_id: 3, price: 6, country: 'new_zeland' },
        { plan_id: 4, price: 60, country: 'new_zeland' },
        { plan_id: 5, price: 12, country: 'new_zeland' },
        { plan_id: 6, price: 120, country: 'new_zeland' },
        { option_id: 1, limit: 6, country: 'new_zeland' },
        { option_id: 2, limit: 3, country: 'new_zeland' },
        { option_id: 3, limit: 3, country: 'new_zeland' },
        { option_id: 4, limit: 20, country: 'new_zeland' },
        { option_id: 5, limit: 10, country: 'new_zeland' },
        { option_id: 6, limit: 10, country: 'new_zeland' },
        { option_id: 7, limit: 100, country: 'new_zeland' },
        { option_id: 8, limit: 50, country: 'new_zeland' },
        { option_id: 9, limit: 50, country: 'new_zeland' },
        { option_id: 10, limit: 10, country: 'new_zeland' },
        { option_id: 11, limit: 20, country: 'new_zeland' },
        { option_id: 12, limit: 10000, country: 'new_zeland' },
        { option_id: 13, limit: 0, country: 'new_zeland' },
        { option_id: 14, limit: 5, country: 'new_zeland' },
        { option_id: 15, limit: 10, country: 'new_zeland' },
        { option_id: 16, limit: 5, country: 'new_zeland' },
        { option_id: 17, limit: 10, country: 'new_zeland' },
        { option_id: 18, limit: 50, country: 'new_zeland' },

        { plan_id: 1, price: 0, country: 'kazahstan' },
        { plan_id: 2, price: 0, country: 'kazahstan' },
        { plan_id: 3, price: 1900, country: 'kazahstan' },
        { plan_id: 4, price: 19000, country: 'kazahstan' },
        { plan_id: 5, price: 3900, country: 'kazahstan' },
        { plan_id: 6, price: 39000, country: 'kazahstan' },
        { option_id: 1, limit: 6, country: 'kazahstan' },
        { option_id: 2, limit: 3, country: 'kazahstan' },
        { option_id: 3, limit: 3, country: 'kazahstan' },
        { option_id: 4, limit: 20, country: 'kazahstan' },
        { option_id: 5, limit: 10, country: 'kazahstan' },
        { option_id: 6, limit: 10, country: 'kazahstan' },
        { option_id: 7, limit: 100, country: 'kazahstan' },
        { option_id: 8, limit: 50, country: 'kazahstan' },
        { option_id: 9, limit: 50, country: 'kazahstan' },
        { option_id: 10, limit: 10, country: 'kazahstan' },
        { option_id: 11, limit: 20, country: 'kazahstan' },
        { option_id: 12, limit: 10000, country: 'kazahstan' },
        { option_id: 13, limit: 0, country: 'kazahstan' },
        { option_id: 14, limit: 5, country: 'kazahstan' },
        { option_id: 15, limit: 10, country: 'kazahstan' },
        { option_id: 16, limit: 5, country: 'kazahstan' },
        { option_id: 17, limit: 10, country: 'kazahstan' },
        { option_id: 18, limit: 50, country: 'kazahstan' },

        { plan_id: 1, price: 0, country: 'kyrgyzstan' },
        { plan_id: 2, price: 0, country: 'kyrgyzstan' },
        { plan_id: 3, price: 360, country: 'kyrgyzstan' },
        { plan_id: 4, price: 3600, country: 'kyrgyzstan' },
        { plan_id: 5, price: 730, country: 'kyrgyzstan' },
        { plan_id: 6, price: 7300, country: 'kyrgyzstan' },
        { option_id: 1, limit: 6, country: 'kyrgyzstan' },
        { option_id: 2, limit: 3, country: 'kyrgyzstan' },
        { option_id: 3, limit: 3, country: 'kyrgyzstan' },
        { option_id: 4, limit: 20, country: 'kyrgyzstan' },
        { option_id: 5, limit: 10, country: 'kyrgyzstan' },
        { option_id: 6, limit: 10, country: 'kyrgyzstan' },
        { option_id: 7, limit: 100, country: 'kyrgyzstan' },
        { option_id: 8, limit: 50, country: 'kyrgyzstan' },
        { option_id: 9, limit: 50, country: 'kyrgyzstan' },
        { option_id: 10, limit: 10, country: 'kyrgyzstan' },
        { option_id: 11, limit: 20, country: 'kyrgyzstan' },
        { option_id: 12, limit: 10000, country: 'kyrgyzstan' },
        { option_id: 13, limit: 0, country: 'kyrgyzstan' },
        { option_id: 14, limit: 5, country: 'kyrgyzstan' },
        { option_id: 15, limit: 10, country: 'kyrgyzstan' },
        { option_id: 16, limit: 5, country: 'kyrgyzstan' },
        { option_id: 17, limit: 10, country: 'kyrgyzstan' },
        { option_id: 18, limit: 50, country: 'kyrgyzstan' },
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
        { value: 'russia', country_code_iso3: 'RUS', default_language: 'russian', google_code: 'RU', currency: 'RUR', google_language: 'ru', weight: 'tonn', distance: 'kilometer', sector: 'one' },
        { value: 'belarus', country_code_iso3: 'BLR', default_language: 'russian', google_code: 'BY', currency: 'BYR', google_language: 'ru', weight: 'tonn', distance: 'kilometer', sector: 'one' },
        { value: 'kazahstan', country_code_iso3: 'KAZ', default_language: 'russian', google_code: 'KZ', currency: 'KZT', google_language: 'ru', weight: 'tonn', distance: 'kilometer', sector: 'one' },
        { value: 'kyrgyzstan', country_code_iso3: 'KGZ', default_language: 'russian', google_code: 'KG', currency: 'KGS', google_language: 'ru', weight: 'tonn', distance: 'kilometer', sector: 'one' },

        { value: 'canada', country_code_iso3: 'CAN', default_language: 'english', google_code: 'CA', currency: 'CAD', google_language: 'en', weight: 'pound', distance: 'mile', sector: 'two' },
        { value: 'usa', country_code_iso3: 'USA', default_language: 'english', google_code: 'US', currency: 'USD', google_language: 'en', weight: 'pound', distance: 'mile', sector: 'two' },
        { value: 'united_kingdom', country_code_iso3: 'GBR', default_language: 'english', google_code: 'UK', currency: 'GBP', google_language: 'en', weight: 'pound', distance: 'mile', sector: 'two' },
        { value: 'australia', country_code_iso3: 'AUS', default_language: 'english', google_code: 'AU', currency: 'AUD', google_language: 'en', weight: 'pound', distance: 'mile', sector: 'two' },
        { value: 'new_zeland', country_code_iso3: 'NZL', default_language: 'english', google_code: 'NZ', currency: 'NZD', google_language: 'en', weight: 'tonn', distance: 'kilometer', sector: 'two' },


        // { value: 'greece', country_code_iso3: 'GRC', default_language: 'english', google_code: 'GR', currency: 'EUR', google_language: 'el', weight: 'tonn', distance: 'kilometer' },
        // { value: 'spain', country_code_iso3: 'ESP', default_language: 'english', google_code: 'ES', currency: 'EUR', google_language: 'es', weight: 'tonn', distance: 'kilometer' },
        // { value: 'sweden', country_code_iso3: 'SWE', default_language: 'english', google_code: 'SE', currency: 'EUR', google_language: 'sv', weight: 'tonn', distance: 'kilometer' },
        // { value: 'finland', country_code_iso3: 'FIN', default_language: 'english', google_code: 'FI', currency: 'EUR', google_language: 'fi', weight: 'tonn', distance: 'kilometer' },
    ]

    for (const row of countries) {
        let checkItem = await Country.findOne({ where: { value: row.value } })
        if (checkItem) {
            await Country.update({ default_language: row.default_language, google_code: row.google_code, currency: row.currency, weight: row.weight, distance: row.distance, country_code_iso3: row.country_code_iso3, sector: row.sector, google_language: row.google_language }, { where: { value: row.value } })
        } else {
            await Country.create({ value: row.value, default_language: row.default_language, google_code: row.google_code, currency: row.currency, weight: row.weight, distance: row.distance, country_code_iso3: row.country_code_iso3, sector: row.sector, google_language: row.google_language })
        }
    }

    let userAppSettingsDefaultList = [
        { name: 'sms_messaging', value: true, role: 'both' },
        { name: 'email_messaging', value: true, role: 'both' }
    ]

    let userInfos = await UserInfo.findAll()

    for (const userInfo of userInfos) {
        for (const setting of userAppSettingsDefaultList) {
            await UserAppSetting.findOrCreate({ where: { name: setting.name, userInfoId: userInfo.id }, defaults: { value: true } })
        }
    }


    //one time handlers
    let transports = await Transport.findAll()
    for (const transport of transports) {
        let user_info = await UserInfo.findOne({ where: { id: transport.userInfoId } })
        let user = await User.findOne({ where: { id: user_info.userId } })
        if (!transport.driver_id) {
            await Transport.update({ driver_id: user.id }, { where: { id: transport.id } })
        }
    }

    console.log('default data overwritted!');
}















