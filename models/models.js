const sequelize = require('../db')
const { DataTypes } = require('sequelize')
const { v4 } = require('uuid');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, require: true },
    password: { type: DataTypes.STRING, require: true },
    country: { type: DataTypes.STRING, require: true },
    isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
    isModerated: { type: DataTypes.BOOLEAN, defaultValue: false },
    isChecked: { type: DataTypes.BOOLEAN, defaultValue: false },
    activationLink: { type: DataTypes.STRING },
    emailRecoveryCode: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    user_agreement_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    privacy_policy_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    cookies_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    age_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    personal_data_agreement_accepted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const Token = sequelize.define('token', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING, require: true },
})

const UserInfo = sequelize.define('user_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.STRING, defaultValue: '' },
    country: { type: DataTypes.STRING, defaultValue: '' },

    city: { type: DataTypes.STRING, defaultValue: '' },
    city_latitude: { type: DataTypes.DECIMAL },
    city_longitude: { type: DataTypes.DECIMAL },

    phone: { type: DataTypes.STRING, defaultValue: '' },
    website: { type: DataTypes.STRING, defaultValue: '' },
    email: { type: DataTypes.STRING, defaultValue: '' },
    company_name: { type: DataTypes.STRING, defaultValue: '' },
    company_inn: { type: DataTypes.STRING, defaultValue: '' },

    company_adress: { type: DataTypes.STRING, defaultValue: '' },
    company_adress_latitude: { type: DataTypes.DECIMAL },
    company_adress_longitude: { type: DataTypes.DECIMAL },

    type_of_customer: { type: DataTypes.STRING, defaultValue: '' },
    name_surname_fathersname: { type: DataTypes.STRING, defaultValue: '' },
    passport_number: { type: DataTypes.STRING, defaultValue: '' },
    passport_date_of_issue: { type: DataTypes.STRING, defaultValue: '' },
    passport_issued_by: { type: DataTypes.STRING, defaultValue: '' },
    passport_number: { type: DataTypes.STRING, defaultValue: '' },
    legal: { type: DataTypes.STRING, defaultValue: '' },
    total_solvency: { type: DataTypes.DECIMAL, defaultValue: 0 },
    solvency_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_in_time: { type: DataTypes.DECIMAL, defaultValue: 0 },
    in_time_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_politeness: { type: DataTypes.DECIMAL, defaultValue: 0 },
    politeness_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_facilities: { type: DataTypes.DECIMAL, defaultValue: 0 },
    facilities_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    disruption_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_rating: { type: DataTypes.DECIMAL, defaultValue: 0 },
    complete_orders_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    files: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
    uuid: { type: DataTypes.STRING, defaultValue: '' },
    referal_id: { type: DataTypes.STRING },

    isModerated: { type: DataTypes.BOOLEAN, defaultValue: false },
    isChecked: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const OrderRating = sequelize.define('order_rating', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    in_time: { type: DataTypes.INTEGER },
    politeness: { type: DataTypes.INTEGER },
    facilities: { type: DataTypes.INTEGER },

    ratedUserInfoId: { type: DataTypes.INTEGER },
    raterUserInfoId: { type: DataTypes.INTEGER },
})

const OtherRating = sequelize.define('other_rating', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    solvency: { type: DataTypes.INTEGER, defaultValue: 0 },
    ratedUserInfoId: { type: DataTypes.INTEGER },
    raterUserInfoId: { type: DataTypes.INTEGER },
})

const Transport = sequelize.define('transport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING },
    transport_registration_plate: { type: DataTypes.STRING },
    load_capacity: { type: DataTypes.STRING },
    side_type: { type: DataTypes.STRING },
    tag: { type: DataTypes.STRING },
    thermo_bag: { type: DataTypes.BOOLEAN },
    hydraulic_platform: { type: DataTypes.BOOLEAN },
    side_loading: { type: DataTypes.BOOLEAN },
    glass_stand: { type: DataTypes.BOOLEAN },
    refrigerator_minus: { type: DataTypes.BOOLEAN },
    refrigerator_plus: { type: DataTypes.BOOLEAN },
    thermo_van: { type: DataTypes.BOOLEAN },
    // image: { type: DataTypes.STRING, defaultValue: '' }, 
    files: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },

    ad_text: { type: DataTypes.STRING, defaultValue: '' },
    ad_show: { type: DataTypes.BOOLEAN, defaultValue: false },
    moderated: { type: DataTypes.STRING, defaultValue: '' },
    moderation_comment: { type: DataTypes.STRING, defaultValue: '' },

    from_fast: { type: DataTypes.BOOLEAN, defaultValue: false },

})


const TransportByOrder = sequelize.define('transport_by_order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transportId: { type: DataTypes.INTEGER },
    orderId: { type: DataTypes.INTEGER },
})

// what to do if transport deleted cut it from user info


const Equipment = sequelize.define('equipment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, defaultValue: '' },
    name: { type: DataTypes.STRING, defaultValue: '' },
})

const TransportType = sequelize.define('transport_type', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, defaultValue: '' },
    name: { type: DataTypes.STRING, defaultValue: '' },

})

const TransportSideType = sequelize.define('transport_side_type', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, defaultValue: '' },
    name: { type: DataTypes.STRING, defaultValue: '' },
})

const TransportLoadCapacity = sequelize.define('transport_load_capacity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    capacity: { type: DataTypes.STRING, defaultValue: '' },
    name: { type: DataTypes.STRING, defaultValue: '' },
})

const Order = sequelize.define('order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_comment: { type: DataTypes.STRING },
    cost: { type: DataTypes.INTEGER },
    mileage: { type: DataTypes.INTEGER, defaultValue: undefined },
    estimated_time: { type: DataTypes.TIME },
    carrierId: { type: DataTypes.INTEGER },
    order_status: { type: DataTypes.STRING },
    carrier_arc_status: { type: DataTypes.STRING },
    customer_arc_status: { type: DataTypes.STRING },
    order_status_comment: { type: DataTypes.STRING },
    order_final_status: { type: DataTypes.STRING },
    order_type: { type: DataTypes.STRING },
    updated_by_role: { type: DataTypes.STRING, defaultValue: '' },
    disrupted_by: { type: DataTypes.STRING, defaultValue: '' },
    restored: { type: DataTypes.STRING, defaultValue: '' },
    type: { type: DataTypes.STRING, defaultValue: '' },
    load_capacity: { type: DataTypes.STRING, defaultValue: '' },
    side_type: { type: DataTypes.STRING, defaultValue: '' },
    thermo_bag: { type: DataTypes.BOOLEAN },
    hydraulic_platform: { type: DataTypes.BOOLEAN },
    side_loading: { type: DataTypes.BOOLEAN },
    glass_stand: { type: DataTypes.BOOLEAN },
    refrigerator_minus: { type: DataTypes.BOOLEAN },
    refrigerator_plus: { type: DataTypes.BOOLEAN },
    thermo_van: { type: DataTypes.BOOLEAN },

    country: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },//remove after moving to the start and finish points

    start_lat: { type: DataTypes.DECIMAL },
    start_lng: { type: DataTypes.DECIMAL },
    end_lat: { type: DataTypes.DECIMAL },
    end_lng: { type: DataTypes.DECIMAL },

    userInfoId: { type: DataTypes.INTEGER },
    pointsIntegrationId: { type: DataTypes.STRING },
    files: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },

    direction_response: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
})

const CarriagePrice = sequelize.define('carriage_price', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price_per_km: { type: DataTypes.INTEGER },
    carry_in: { type: DataTypes.INTEGER },
    carry_out: { type: DataTypes.INTEGER },
    waiting: { type: DataTypes.INTEGER },
    city: { type: DataTypes.STRING },
})

// const SubscriptionPrice = sequelize.define('subscription_price', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     price_1: { type: DataTypes.INTEGER },
//     price_3: { type: DataTypes.INTEGER },
//     price_6: { type: DataTypes.INTEGER },
//     price_12: { type: DataTypes.INTEGER },
//     free_trial: { type: DataTypes.INTEGER },
//     city: { type: DataTypes.STRING },
// })

const Offer = sequelize.define('offer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userInfoId: { type: DataTypes.INTEGER },
    carrierId: { type: DataTypes.INTEGER },
    transportid: { type: DataTypes.INTEGER },
    cost: { type: DataTypes.INTEGER },
    time_from: { type: DataTypes.DATE },
    carrier_comment: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    changedBy: { type: DataTypes.INTEGER },
})

const Point = sequelize.define('point', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    city: { type: DataTypes.STRING },
    point: { type: DataTypes.STRING },
    latitude: { type: DataTypes.DECIMAL },
    longitude: { type: DataTypes.DECIMAL },
    time: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING },
    sequence: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },

    customer_comment: { type: DataTypes.STRING },
    carrier_comment: { type: DataTypes.STRING },

    services: { type: DataTypes.STRING },

    updated_by_role: { type: DataTypes.STRING, defaultValue: '' },

    updated_time: { type: DataTypes.DATE },
    finished_time: { type: DataTypes.DATE },

    orderIntegrationId: { type: DataTypes.STRING },
})

const PartnerGroup = sequelize.define('partner_group', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

const PartnerByGroup = sequelize.define('partner_by_group', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partnerGroupId: { type: DataTypes.INTEGER },
    partnerId: { type: DataTypes.INTEGER },
    userInfoId: { type: DataTypes.INTEGER },
})

const OrderByGroup = sequelize.define('order_by_group', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupId: { type: DataTypes.INTEGER },
    orderId: { type: DataTypes.INTEGER },
})

const OrderByPartner = sequelize.define('order_by_partner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partnerId: { type: DataTypes.INTEGER },
    orderId: { type: DataTypes.INTEGER },
})

const Partner = sequelize.define('partner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partnerUserInfoId: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, defaultValue: 'normal' },
})

const ServerNotification = sequelize.define('server_notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.STRING },
    viewed: { type: DataTypes.BOOLEAN, defaultValue: false },
    type: { type: DataTypes.STRING, defaultValue: 'success' },
    uuid: { type: DataTypes.STRING, defaultValue: '' },
    userInfoId: { type: DataTypes.INTEGER, defaultValue: 0 },
})

const NotificationState = sequelize.define('notification_state', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_state: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
    point_state: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
    offer_state: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
    partner_state: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },// make add tracking partner
})

const UserAppState = sequelize.define('user_app_state', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    state: {
        type: DataTypes.JSON, defaultValue:
            JSON.stringify({
                favorite_order_state: [],
            })
    },
})

const UserAppLimit = sequelize.define('user_app_limit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_create_order_limit_per_day: { type: DataTypes.INTEGER, defaultValue: 6 },
    carrier_offer_limit_per_day: { type: DataTypes.INTEGER, defaultValue: 3 },
    carrier_take_order_limit_per_day: { type: DataTypes.INTEGER, defaultValue: 3 },

    customer_new_order_range: { type: DataTypes.INTEGER, defaultValue: 10 },
    customer_new_order_point_limit: { type: DataTypes.INTEGER, defaultValue: 5 },
    carrier_take_order_city_limit: { type: DataTypes.INTEGER, defaultValue: 0 },

    carrier_block_rating: { type: DataTypes.INTEGER, defaultValue: 2 },// when trying to take actions from a subscription, we check additionally and throw an error up to a subscription error
    customer_block_rating: { type: DataTypes.INTEGER, defaultValue: 2 },// when trying to take actions from a subscription, we check additionally and throw an error up to a subscription error
    customer_critical_solvency: { type: DataTypes.INTEGER, defaultValue: 2 },
    block_limit: { type: DataTypes.INTEGER, defaultValue: 2 },//how many times after blocking we resume work after a break
    block_interval: { type: DataTypes.INTEGER, defaultValue: 2 },// how many days does one block last
})
const UserAppSetting = sequelize.define('user_app_setting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, defaultValue: '' },
    value: { type: DataTypes.BOOLEAN },

    /*
        //notifications
        carrier_new_orders_notification: { type: DataTypes.BOOLEAN, defaultValue: true },//when creating an order in the mail controller, check if one of the recipients has such a setting
        //partner rules
        customer_fix_points_before_finish_order: { type: DataTypes.BOOLEAN, defaultValue: false },//when the carrier tries to complete check if the customer has such a setting
        customer_show_orders_just_favorite_partners: { type: DataTypes.BOOLEAN, defaultValue: false },//apply functionality for_group
        //language
        language: { type: DataTypes.STRING, defaultValue: 'english' },
        //design
        theme: { type: DataTypes.STRING, defaultValue: 'light' },
        font_size: { type: DataTypes.STRING, defaultValue: 'normal' },
        */
})


const LimitCounter = sequelize.define('limit_counter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_create_amount_per_day: { type: DataTypes.INTEGER, defaultValue: 0 },
    customer_create_started: { type: DataTypes.DATE },
    carrier_offer_amount_per_day: { type: DataTypes.INTEGER, defaultValue: 0 },
    carrier_offer_started: { type: DataTypes.DATE },
    carrier_take_order_amount_per_day: { type: DataTypes.INTEGER, defaultValue: 0 },
    carrier_take_order_started: { type: DataTypes.DATE },
    block_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    block_started: { type: DataTypes.DATE },
    trial_used: { type: DataTypes.BOOLEAN, defaultValue: false }
})

const AppState = sequelize.define('app_state', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    state: { type: DataTypes.JSON, defaultValue: JSON.stringify({}) },
})

const AppLimit = sequelize.define('app_setting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    settings: { type: DataTypes.JSON, defaultValue: JSON.stringify({}) },
})

const AppLimitCounter = sequelize.define('app_limit_counter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const Translation = sequelize.define('translation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    service: { type: DataTypes.STRING, defaultValue: '' },
    russian: { type: DataTypes.STRING, defaultValue: '' },
    english: { type: DataTypes.STRING, defaultValue: '' },
    spain: { type: DataTypes.STRING, defaultValue: '' },
    color: { type: DataTypes.STRING, defaultValue: '' },
    type: { type: DataTypes.STRING, defaultValue: '' },
})

const Subscription = sequelize.define('subscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataTypes.STRING, defaultValue: 'none' },
    paid_to: { type: DataTypes.DATE },
    planId: { type: DataTypes.INTEGER, defaultValue: 0 },
    country: { type: DataTypes.STRING, defaultValue: '' },
})

const SubscriptionPlan = sequelize.define('subscription_plan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plan_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING, defaultValue: '' },
    value: { type: DataTypes.STRING, defaultValue: '' },
    bage: { type: DataTypes.STRING, defaultValue: '' },
    comment: { type: DataTypes.STRING, defaultValue: '' },
    price: { type: DataTypes.INTEGER },
    country: { type: DataTypes.STRING, defaultValue: '' },
    frequency: { type: DataTypes.STRING, defaultValue: '' },
    period: { type: DataTypes.INTEGER, defaultValue: 0 },
})

const SubscriptionOption = sequelize.define('subscription_option', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    option_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING, defaultValue: '' },
    comment: { type: DataTypes.STRING, defaultValue: '' },
    value: { type: DataTypes.STRING, defaultValue: '' },
    role: { type: DataTypes.STRING, defaultValue: '' },
    limit: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, defaultValue: '' },
    country: { type: DataTypes.STRING, defaultValue: '' },
})

const Invoice = sequelize.define('invoice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userInfoId: { type: DataTypes.INTEGER },
    payment_id: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING },
    order_details: { type: DataTypes.JSON, defaultValue: JSON.stringify([]) },
})


const SubscriptionOptionsByPlan = sequelize.define('subscription_options_by_plan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    optionId: { type: DataTypes.INTEGER },
    planId: { type: DataTypes.INTEGER },
})

const Country = sequelize.define('country', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.STRING },
    default_language: { type: DataTypes.STRING },
    google_code: { type: DataTypes.STRING },
    google_language: { type: DataTypes.STRING },
    currency: { type: DataTypes.STRING },
    weight: { type: DataTypes.STRING },
    distance: { type: DataTypes.STRING },
    country_code_iso3: { type: DataTypes.STRING },
    sector: { type: DataTypes.STRING },
})

const City = sequelize.define('city', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    lat: { type: DataTypes.DECIMAL },
    lng: { type: DataTypes.DECIMAL },
    countryId: { type: DataTypes.INTEGER },
})

const Adress = sequelize.define('adress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    lat: { type: DataTypes.DECIMAL },
    lng: { type: DataTypes.DECIMAL },
    cityId: { type: DataTypes.INTEGER },
    countryId: { type: DataTypes.INTEGER },
})

const OrderViewed = sequelize.define('order_viewed', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    userInfoId: { type: DataTypes.INTEGER },
    contact_viewed: { type: DataTypes.BOOLEAN, defaultValue: false }
})

const TransportViewed = sequelize.define('transport_viewed', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transportId: { type: DataTypes.INTEGER },
    userInfoId: { type: DataTypes.INTEGER },
    contact_viewed: { type: DataTypes.BOOLEAN, defaultValue: false }
})

const AdViewed = sequelize.define('ad_viewed', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    adId: { type: DataTypes.INTEGER },
    userInfoId: { type: DataTypes.INTEGER },
    contact_viewed: { type: DataTypes.BOOLEAN, defaultValue: false }
})


const SafetyOrderHash = sequelize.define('safety_order_hash', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    customer_data: { type: DataTypes.JSON },
    carriier_data: { type: DataTypes.JSON },
})

const SafetyIpHash = sequelize.define('safety_ip_hash', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userInfoId: { type: DataTypes.INTEGER },
    ip: { type: DataTypes.STRING },
})

const NotificationHistory = sequelize.define('notification_history', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    userInfoId: { type: DataTypes.INTEGER },
    memberUserInfoId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, defaultValue: '' },
    subject: { type: DataTypes.STRING, defaultValue: '' },
    message: { type: DataTypes.TEXT, defaultValue: '' },
    status: { type: DataTypes.STRING, defaultValue: '' }
})

const Visit = sequelize.define('visit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ip: { type: DataTypes.STRING, defaultValue: '' },
})


UserInfo.hasOne(LimitCounter)
LimitCounter.belongsTo(UserInfo)

UserInfo.hasOne(UserAppState)
UserAppState.belongsTo(UserInfo)

UserInfo.hasMany(UserAppSetting)
UserAppSetting.belongsTo(UserInfo)

UserInfo.hasOne(UserAppLimit)
UserAppLimit.belongsTo(UserInfo)

User.hasOne(Token)
Token.belongsTo(User)

UserInfo.hasOne(Subscription)
Subscription.belongsTo(UserInfo)

UserInfo.hasMany(Partner)
Partner.belongsTo(UserInfo)

UserInfo.hasMany(PartnerGroup)
PartnerGroup.belongsTo(UserInfo)

Order.hasMany(Offer)
Offer.belongsTo(Order)

User.hasOne(UserInfo)
UserInfo.belongsTo(User)

UserInfo.hasOne(NotificationState)
NotificationState.belongsTo(UserInfo)

UserInfo.hasOne(UserAppState)
UserAppState.belongsTo(UserInfo)

Order.hasMany(OrderRating)
OrderRating.belongsTo(Order)

UserInfo.hasMany(Transport)
Transport.belongsTo(UserInfo)

Order.belongsTo(User)
User.hasMany(Order)

module.exports = {
    Country,
    SubscriptionPlan,
    SubscriptionOption,
    SubscriptionOptionsByPlan,
    User,
    UserInfo,
    Transport,
    Equipment,
    OrderRating,
    OtherRating,
    Order,
    CarriagePrice,
    // SubscriptionPrice,
    Offer,
    Point,
    Partner,
    NotificationState,
    PartnerGroup,
    PartnerByGroup,
    OrderByGroup,
    OrderByPartner,
    ServerNotification,
    Subscription,
    Token,
    UserAppSetting,
    UserAppState,
    AppLimit,
    AppState,
    LimitCounter,
    AppLimitCounter,
    Translation,
    TransportType,
    TransportSideType,
    TransportLoadCapacity,
    UserAppLimit,
    City,
    SafetyOrderHash,
    SafetyIpHash,
    OrderViewed,
    TransportByOrder,
    Invoice,
    NotificationHistory,
    Visit,
    TransportViewed,
    AdViewed
}






















