const { Translation, SubscriptionPlan, SubscriptionOption, SubscriptionOptionsByPlan, Equipment, TransportLoadCapacity, TransportSideType, TransportType, Country } = require('../models/models')


module.exports = async function () {
    console.log('default data handler started...');

    let plans = [
        { name: 'none', value: 'none', bage: '', comment: '', price: '', country: 'russia', frequency: '', period: 0 },
        { name: 'free', value: 'free', bage: '30 дней', comment: 'free', price: '0', country: 'russia', frequency: 'month', period: 31 },
        { name: 'standart', value: 'standart_month', bage: 'Месяц', comment: 'free', price: '299', country: 'russia', frequency: 'month', period: 31 },
        { name: 'standart', value: 'standart_year', bage: 'Год', comment: 'free', price: '2899', country: 'russia', frequency: 'year', period: 365 },
        { name: 'professional', value: 'professional_month', bage: 'Месяц', comment: 'free', price: '599', country: 'russia', frequency: 'month', period: 31 },
        { name: 'professional', value: 'professional_year', bage: 'Год', comment: 'free', price: '5799', country: 'russia', frequency: 'month', period: 365 },
    ]

    for (const row of plans) {
        SubscriptionPlan.findOrCreate({
            where: {
                name: row.name, value: row.value, bage: row.bage, comment: row.comment, country: row.country, frequency: row.frequency, period: row.period, price: row.price
            }
        })
    }

    let options = [
        { name: '6 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 6, type: 'order' },
        { name: '3 предложения по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 3, type: 'offer' },
        { name: '3 заказа в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 3, type: 'take_order' },
        { name: '20 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 20, type: 'order' },
        { name: '10 предложений по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 10, type: 'offer' },
        { name: '10 заказав в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 10, type: 'take_order' },
        { name: '100 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 100, type: 'order' },
        { name: '50 предложений по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 50, type: 'offer' },
        { name: '50 заказов в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 50, type: 'take_order' },


        { name: 'Заказы в городе', comment: 'Возможность размещать аказы на расстоянии до 10 километров от центра города', value: '', role: 'customer', limit: 10, type: 'order_range' }, // without     
        { name: 'Заказы в городе', comment: 'Возможность размещать заказы на расстоянии до 20 километров от центра города', value: '', role: 'customer', limit: 20, type: 'order_range' }, // standart and trial
        { name: 'Заказы в стране', comment: 'Возможность управлять радиусом поиска адресов и размещать заказы по всей стране', value: '', role: 'customer', limit: 10000, type: 'order_range' },//prof

        // ввести лимиты расчета маршрутов относительно количества заказов или заказов в работе для заказчика

        { name: 'Заказы в городе', comment: 'Возможность отслеживать заказы в вашем городе', value: '', role: 'carrier', limit: 0, type: 'order_range' },  // without        
        { name: 'Заказы в стране', comment: 'Возможность выбирать до 5 городов для отслеживания заказов', value: '', role: 'carrier', limit: 5, type: 'order_range' }, // standart and trial
        { name: 'Заказы в стране', comment: 'Возможность выбирать до 10 городов для отслеживания заказов', value: '', role: 'carrier', limit: 10, type: 'order_range' }, //prof

        // лимит пользования сервисом контролируется рейтингом        
        // лейбл проф участник по определенным параметроам в том числе подписка

        { name: '5 адресов в заказе', comment: 'Возможность включить в один заказ до 5 адресов', value: '', role: 'customer', limit: 5, type: 'point_limit' }, // without     
        { name: '10 адресов в заказе', comment: 'Возможность включить в один заказ до 10 адресов', value: '', role: 'customer', limit: 10, type: 'point_limit' }, // standart and trial
        { name: '50 адресов в заказе', comment: 'Возможность включить в один заказ до 50 адресов', value: '', role: 'customer', limit: 50, type: 'point_limit' },//prof
    ]

    for (const row of options) {
        SubscriptionOption.findOrCreate({
            where: {
                name: row.name, comment: row.comment, value: row.value, role: row.role, limit: row.limit, type: row.type
            }
        })
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
        SubscriptionOptionsByPlan.findOrCreate({
            where: {
                planId: row.planId, optionId: row.optionId
            }
        })
    }

    let translation = [
        { service: 'russia', russian: 'Россия', english: '', spain: '', color: '', type: 'country' },
        { service: 'greece', russian: 'Герция', english: '', spain: '', color: '', type: 'country' },
        { service: 'canada', russian: 'Канада', english: '', spain: '', color: '', type: 'country' },
        { service: 'spain', russian: 'Испания', english: '', spain: '', color: '', type: 'country' },
        { service: 'sweden', russian: 'Швеция', english: '', spain: '', color: '', type: 'country' },
        { service: 'finland', russian: 'Финляндия', english: '', spain: '', color: '', type: 'country' },
        { service: 'montenegin', russian: 'Черногория', english: '', spain: '', color: '', type: 'country' },

        { service: 'krasnodar', russian: 'Краснодар', english: 'Krasnodar', spain: '', color: '', type: 'city' },
        { service: 'sevastopol', russian: 'Севастополь', english: '', spain: '', color: '', type: 'city' },
        { service: 'simferopol', russian: 'Симферополь', english: '', spain: '', color: '', type: 'city' },
        { service: 'novorossiysk', russian: 'Новороссийск', english: '', spain: '', color: '', type: 'city' },
        { service: 'rostov_on_don', russian: 'Ростов на Дону', english: '', spain: '', color: '', type: 'city' },
        { service: 'gelendzhik', russian: 'Геленджик', english: 'Gelendzhik', spain: '', color: '', type: 'city' },

        { service: 'arc', russian: 'В архиве', english: '', spain: '', color: 'rgb(210,219,236, 0.8)', type: 'order_status' },
        { service: 'new', russian: 'Новый', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'order_status' },
        { service: 'postponed', russian: 'Отложен', english: '', spain: '', color: 'rgb(241,196,15,0.8)', type: 'order_status' },
        { service: 'canceled', russian: 'Отменен', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'order_status' },
        { service: 'completed', russian: 'Выполнен', english: '', spain: '', color: 'rgb(214,232,255,0.8)', type: 'order_status' },
        { service: 'inWork', russian: 'В работе', english: '', spain: '', color: 'rgb(254, 145, 40,0.8)', type: 'order_status' },
        { service: 'disrupt', russian: 'Сорван', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'order_status' },

        { service: 'order', russian: 'Заказ', english: '', spain: '', color: '', type: 'order_type' },
        { service: 'auction', russian: 'Аукцион', english: '', spain: '', color: '', type: 'order_type' },

        { service: 'retail', russian: 'Розничной торговли', english: '', color: '', spain: '', type: 'user_info' },
        { service: 'wholesale', russian: 'Оптовой торговли', english: '', color: '', spain: '', type: 'user_info' },
        { service: 'food_delivery', russian: 'Доставки продуктов', english: '', spain: '', color: '', type: 'user_info' },
        { service: 'ready_food_delivery', russian: 'Доставки готовых блюд', english: '', spain: '', color: '', type: 'user_info' },
        { service: 'electronics_repair', russian: 'Ремонта электроники', english: '', spain: '', color: '', type: 'user_info' },
        { service: 'for_myself', russian: 'Себя', english: '', spain: '', color: '', type: 'user_info' },

        { service: 'person', russian: 'Физическое лицо', english: '', spain: '', color: '', type: 'user_info' },
        { service: 'entity', russian: 'Юридическое лицо', english: '', spain: '', color: '', type: 'user_info' },
        { service: 'sole_trader', russian: 'Индивидуальный предприниматель', english: '', spain: '', color: '', type: 'user_info' },

        { service: 'walk', russian: 'Пешком', english: '', spain: '', color: '', type: 'transport' },
        { service: 'bike', russian: 'Велосипед', english: '', spain: '', color: '', type: 'transport' },
        { service: 'electric_scooter', russian: 'Электросамокат', english: '', spain: '', color: '', type: 'transport' },
        { service: 'scooter', russian: 'Мопед', english: '', spain: '', color: '', type: 'transport' },
        { service: 'car', russian: 'Легковой автомобиль', english: '', spain: '', color: '', type: 'transport' },
        { service: 'combi', russian: 'Автомобиль комби', english: '', spain: '', color: '', type: 'transport' },
        { service: 'minibus', russian: 'Микроавтобуc', english: '', spain: '', color: '', type: 'transport' },
        { service: 'truck', russian: 'Грузовой автомобиль', english: '', spain: '', color: '', type: 'transport' },

        { service: '1.5', russian: '1.5 тонны', english: '', spain: '', color: '', type: 'transport' },
        { service: '3', russian: '3 тонны', english: '', spain: '', color: '', type: 'transport' },
        { service: '5', russian: '5 тонн', english: '', spain: '', color: '', type: 'transport' },
        { service: '10', russian: '10 тонн', english: '', spain: '', color: '', type: 'transport' },
        { service: '15', russian: '15 тонн', english: '', spain: '', color: '', type: 'transport' },
        { service: '20', russian: '20 тонн', english: '', spain: '', color: '', type: 'transport' },

        { service: 'open_side', russian: 'Открытый борт', english: '', spain: '', color: '', type: 'transport' },
        { service: 'awing', russian: 'Тент', english: '', spain: '', color: '', type: 'transport' },
        { service: 'hard_top', russian: 'Фургон', english: '', spain: '', color: '', type: 'transport' },

        { service: 'thermo_bag', russian: 'Термосумка', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'thermo_van', russian: 'Изотермический фургон', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'refrigerator_minus', russian: 'Рефрежиратор -7', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'refrigerator_plus', russian: 'Рефрежиратор +7', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'hydraulic_platform', russian: 'Гидавлическая платформа', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'glass_stand', russian: 'Стойка для стекол', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'side_loading', russian: 'Боковая загрузка', english: '', spain: '', color: '', type: 'equipment' },
        { service: 'thermo_van', russian: 'Изотермический фургон', english: '', spain: '', color: '', type: 'equipment' },

        { service: 'normal', russian: '', english: '', spain: '', color: 'rgb(241,196,15,0.8)', type: 'partner' },
        { service: 'priority', russian: '', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'partner' },
        { service: 'blocked', russian: '', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'partner' },

        { service: 'name_surname_fathersname', russian: 'фамилию, имя, отчество', english: '', spain: '', color: '', type: 'account' },
        { service: 'country', russian: 'страну', english: '', spain: '', color: '', type: 'account' },
        { service: 'city', russian: 'город и адрес', english: '', spain: '', color: '', type: 'account' },
        { service: 'company_inn', russian: 'ИНН', english: '', spain: '', color: '', type: 'account' },
        { service: 'company_name', russian: 'название компании', english: '', spain: '', color: '', type: 'account' },
        { service: 'company_adress', russian: 'адрес', english: '', spain: '', color: '', type: 'account' },
        { service: 'website', russian: 'сайт компании', english: '', spain: '', color: '', type: 'account' },
        { service: 'legal', russian: 'организационно правовую форму', english: '', spain: '', color: '', type: 'account' },
        { service: 'passport_issued_by', russian: 'учреждение выдавшее паспорт', english: '', spain: '', color: '', type: 'account' },
        { service: 'passport_date_of_issue', russian: 'дату выдачи паспорта', english: '', spain: '', color: '', type: 'account' },
        { service: 'passport_number', russian: 'номер паспорта', english: '', spain: '', color: '', type: 'account' },
        { service: 'phone', russian: 'телефон', english: '', spain: '', color: '', type: 'account' },
        { service: 'type_of_customer', russian: 'вид деятельности', english: '', spain: '', color: '', type: 'account' },
        { service: 'email', russian: 'email для уведомлений', english: '', spain: '', color: '', type: 'account' },
        { service: 'authEmail', russian: 'email для авторизации, на него отправлена ссылка для подтверждения аккаунта', english: '', spain: '', color: '', type: 'account' },
        { service: 'password', russian: 'пароль', english: '', spain: '', color: '', type: 'account' },

        { service: 'none', russian: 'Нет подписки', english: '', spain: '', color: 'grey', type: 'subscription' },
        { service: 'free', russian: 'Free', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'subscription' },
        { service: 'standart', russian: 'Standart', english: '', spain: '', color: 'rgb(241,196,15,0.8)', type: 'subscription' },
        { service: 'standart_year', russian: 'Standart', english: '', spain: '', color: 'rgb(241,196,15,0.8)', type: 'subscription' },
        { service: 'professional', russian: 'Professional', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'subscription' },
        { service: 'professional_year', russian: 'Professional', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'subscription' },

        { service: 'activated', russian: 'Аккаунт активирован', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'account_status' },
        { service: 'not_activated', russian: 'Аккаунт не активирован', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'account_status' },
    ]

    for (const row of translation) {
        Translation.findOrCreate({
            where: {
                service: row.service, russian: row.russian, english: row.english, spain: row.spain, color: row.color, type: row.type
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
        Equipment.findOrCreate({
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
        TransportType.findOrCreate({
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
        TransportSideType.findOrCreate({
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
        TransportLoadCapacity.findOrCreate({
            where: {
                capacity: row.capacity, name: row.name
            }
        })
    }

    countries = [
        { value: 'russia', default_language: '', google_code: 'RU' },
        { value: 'greece', default_language: '', google_code: 'GR' },
        { value: 'canada', default_language: '', google_code: 'CA' },
        { value: 'spain', default_language: '', google_code: 'ES' },
        { value: 'sweden', default_language: '', google_code: 'SE' },
        { value: 'finland', default_language: '', google_code: 'FI' },
    ]

    for (const row of countries) {
        Country.findOrCreate({
            where: {
                value: row.value, default_language: row.default_language, google_code: row.google_code
            }
        })
    }

    console.log('default data overwritted!');
}















