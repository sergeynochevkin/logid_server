const { Translation, SubscriptionPlan, SubscriptionOption, SubscriptionOptionsByPlan, Equipment, TransportLoadCapacity, TransportSideType, TransportType, Country } = require('../models/models')


module.exports = async function () {
    console.log('default data handler started...');

    let translation = [
        { service: 'russia', russian: 'Россия', english: 'Russia', spain: '', color: '', type: 'country' },
        { service: 'greece', russian: 'Герция', english: 'Greece', spain: '', color: '', type: 'country' },
        { service: 'canada', russian: 'Канада', english: 'Canada', spain: '', color: '', type: 'country' },
        { service: 'spain', russian: 'Испания', english: 'Spain', spain: '', color: '', type: 'country' },
        { service: 'sweden', russian: 'Швеция', english: 'Sweden', spain: '', color: '', type: 'country' },
        { service: 'finland', russian: 'Финляндия', english: 'Finland', spain: '', color: '', type: 'country' },
        { service: 'montenegin', russian: 'Черногория', english: 'Montenegro', spain: '', color: '', type: 'country' },

        // { service: 'krasnodar', russian: 'Краснодар', english: 'Krasnodar', spain: '', color: '', type: 'city' },
        // { service: 'sevastopol', russian: 'Севастополь', english: '', spain: '', color: '', type: 'city' },
        // { service: 'simferopol', russian: 'Симферополь', english: '', spain: '', color: '', type: 'city' },
        // { service: 'novorossiysk', russian: 'Новороссийск', english: '', spain: '', color: '', type: 'city' },
        // { service: 'rostov_on_don', russian: 'Ростов на Дону', english: '', spain: '', color: '', type: 'city' },
        // { service: 'gelendzhik', russian: 'Геленджик', english: 'Gelendzhik', spain: '', color: '', type: 'city' },

        { service: 'arc', russian: 'В архиве', english: 'Archived', spain: '', color: 'rgb(210,219,236, 0.8)', type: 'order_status' },
        { service: 'new', russian: 'Новый', english: 'New', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'order_status' },
        { service: 'postponed', russian: 'Отложен', english: 'Postponed', spain: '', color: 'rgb(241,196,15,0.8)', type: 'order_status' },
        { service: 'canceled', russian: 'Отменен', english: 'Canceled', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'order_status' },
        { service: 'completed', russian: 'Выполнен', english: 'Completed', spain: '', color: 'rgb(214,232,255,0.8)', type: 'order_status' },
        { service: 'inWork', russian: 'В работе', english: 'In work', spain: '', color: 'rgb(254, 145, 40,0.8)', type: 'order_status' },
        { service: 'disrupt', russian: 'Сорван', english: 'Disrupted', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'order_status' },

        { service: 'order', russian: 'Заказ', english: 'Order', spain: '', color: '', type: 'order_type' },
        { service: 'auction', russian: 'Аукцион', english: 'Auction', spain: '', color: '', type: 'order_type' },
        { service: 'template', russian: 'Шаблон', english: 'Template', spain: '', color: '', type: 'order_type' },


        { service: 'retail', russian: 'Розничной торговли', english: 'Retail', color: '', spain: '', type: 'user_info' },
        { service: 'wholesale', russian: 'Оптовой торговли', english: 'Whole sale', color: '', spain: '', type: 'user_info' },
        { service: 'food_delivery', russian: 'Доставки продуктов', english: 'Food delivery', spain: '', color: '', type: 'user_info' },
        { service: 'ready_food_delivery', russian: 'Доставки готовых блюд', english: 'Ready food delivery', spain: '', color: '', type: 'user_info' },
        { service: 'electronics_repair', russian: 'Ремонта электроники', english: 'Electrinics repair', spain: '', color: '', type: 'user_info' },
        { service: 'for_myself', russian: 'Себя', english: 'For myself', spain: '', color: '', type: 'user_info' },

        { service: 'person', russian: 'Физическое лицо', english: 'Private person', spain: '', color: '', type: 'user_info' },
        { service: 'entity', russian: 'Юридическое лицо', english: 'Entity', spain: '', color: '', type: 'user_info' },
        { service: 'sole_trader', russian: 'Индивидуальный предприниматель', english: 'Sole trader', spain: '', color: '', type: 'user_info' },

        { service: 'walk', russian: 'Пешком', english: 'Walk', spain: '', color: '', type: 'transport' },
        { service: 'bike', russian: 'Велосипед', english: 'Bike', spain: '', color: '', type: 'transport' },
        { service: 'electric_scooter', russian: 'Электросамокат', english: 'Electric scooter', spain: '', color: '', type: 'transport' },
        { service: 'scooter', russian: 'Мопед', english: 'Moto scooter', spain: '', color: '', type: 'transport' },
        { service: 'car', russian: 'Легковой автомобиль', english: 'Car', spain: '', color: '', type: 'transport' },
        { service: 'combi', russian: 'Автомобиль комби', english: 'Combi car', spain: '', color: '', type: 'transport' },
        { service: 'minibus', russian: 'Микроавтобуc', english: 'Minibus', spain: '', color: '', type: 'transport' },
        { service: 'truck', russian: 'Грузовой автомобиль', english: 'Truck', spain: '', color: '', type: 'transport' },

        { service: '1.5', russian: '1.5 тонны', english: ' 1.5 tons', spain: '', color: '', type: 'transport' },
        { service: '3', russian: '3 тонны', english: '3 tons', spain: '', color: '', type: 'transport' },
        { service: '5', russian: '5 тонн', english: '5 tons', spain: '', color: '', type: 'transport' },
        { service: '10', russian: '10 тонн', english: '10 tons', spain: '', color: '', type: 'transport' },
        { service: '15', russian: '15 тонн', english: '15 tons', spain: '', color: '', type: 'transport' },
        { service: '20', russian: '20 тонн', english: '20 tons', spain: '', color: '', type: 'transport' },
        { service: 'load_capacity', russian: 'Грузоподъемность', english: 'Load capacity', spain: '', color: '', type: 'transport' },

        { service: 'open_side', russian: 'Открытый борт', english: 'Open side', spain: '', color: '', type: 'transport' },
        { service: 'awing', russian: 'Тент', english: 'Awing', spain: '', color: '', type: 'transport' },
        { service: 'hard_top', russian: 'Фургон', english: 'Hard top', spain: '', color: '', type: 'transport' },
        { service: 'side_type', russian: 'Тип кузова', english: 'Side type', spain: '', color: '', type: 'transport' },

        { service: 'thermo_bag', russian: 'Термосумка', english: 'Thermo bag', spain: '', color: '', type: 'equipment' },
        { service: 'thermo_van', russian: 'Изотермический фургон', english: 'Thermo van', spain: '', color: '', type: 'equipment' },
        { service: 'refrigerator_minus', russian: 'Рефрежиратор -7', english: 'Refrigerator -7', spain: '', color: '', type: 'equipment' },
        { service: 'refrigerator_plus', russian: 'Рефрежиратор +7', english: 'Refrigerator +7', spain: '', color: '', type: 'equipment' },
        { service: 'hydraulic_platform', russian: 'Гидавлическая платформа', english: 'Hydraulic platform', spain: '', color: '', type: 'equipment' },
        { service: 'glass_stand', russian: 'Стойка для стекол', english: 'Glass stand', spain: '', color: '', type: 'equipment' },
        { service: 'side_loading', russian: 'Боковая загрузка', english: 'Side loading', spain: '', color: '', type: 'equipment' },
        { service: 'thermo_van', russian: 'Изотермический фургон', english: 'Thermo van', spain: '', color: '', type: 'equipment' },

        { service: 'normal', russian: '', english: '', spain: '', color: 'rgb(241,196,15,0.8)', type: 'partner' },
        { service: 'priority', russian: '', english: '', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'partner' },
        { service: 'blocked', russian: '', english: '', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'partner' },
        { service: 'none', russian: 'Нет подписки', english: 'No subscription', spain: '', color: 'grey', type: 'subscription' },
        { service: 'free', russian: 'Free', english: 'Free', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'subscription' },
        { service: 'standart', russian: 'Standart', english: 'Standart', spain: '', color: 'rgb(241,196,15,0.8)', type: 'subscription' },
        { service: 'standart_year', russian: 'Standart', english: 'Standart', spain: '', color: 'rgb(241,196,15,0.8)', type: 'subscription' },
        { service: 'professional', russian: 'Professional', english: 'Professional', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'subscription' },
        { service: 'professional_year', russian: 'Professional', english: 'Professional', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'subscription' },

        { service: 'activated', russian: 'Аккаунт активирован', english: 'Account activated', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'account_status' },
        { service: 'not_activated', russian: 'Аккаунт не активирован', english: 'Account not activated', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'account_status' },

        { service: 'sign_in', russian: 'Войти', english: 'Sign in', spain: '', color: '', type: 'button' },
        { service: 'sign_out', russian: 'Выйти', english: 'Sign out', spain: '', color: '', type: 'button' },
        { service: 'sign_up', russian: 'Зарегистрироваться', english: 'Sing up', spain: '', color: '', type: 'button' },
        { service: 'send', russian: 'Отправить', english: 'Send', spain: '', color: '', type: 'button' },
        { service: 'edit', russian: 'Редактировать', english: 'Edit', spain: '', color: '', type: 'button' },
        { service: 'finish', russian: 'Завершить', english: 'Finish', spain: '', color: '', type: 'button' },
        { service: 'cancel', russian: 'Отменить', english: 'Cancel', spain: '', color: '', type: 'button' },
        { service: 'take', russian: 'Взять в работу', english: 'Take it', spain: '', color: '', type: 'button' },
        { service: 'save', russian: 'Сохранить', english: 'Save', spain: '', color: '', type: 'button' },
        { service: 'create_template', russian: 'Создать шаблон', english: 'Create template', spain: '', color: '', type: 'button' },
        { service: 'postpone', russian: 'Отложить', english: 'Postpone', spain: '', color: '', type: 'button' },
        { service: 'to_arc', russian: 'В архив', english: 'Move to archive', spain: '', color: '', type: 'button' },
        { service: 'repeat', russian: 'Повторить', english: 'Repeat', spain: '', color: '', type: 'button' },
        { service: 'copy', russian: 'Копировать', english: 'Copy', spain: '', color: '', type: 'button' },
        { service: 'complete', russian: 'Завершить', english: 'Finish', spain: '', color: '', type: 'button' },
        { service: 'restore', russian: 'Восстановить', english: 'Restore', spain: '', color: '', type: 'button' },
        { service: 'not_loading_button', russian: 'Не загрузка', english: 'Not loading', spain: '', color: '', type: 'button' },
        { service: 'not_arrival_button', russian: 'Не подача', english: 'Not arrival', spain: '', color: '', type: 'button' },
        { service: 'create', russian: 'Создать', english: 'Create', spain: '', color: '', type: 'button' },
        { service: 'delete', russian: 'Удалить', english: 'Delete', spain: '', color: '', type: 'button' },
        { service: 'delete_point', russian: 'Удалить точку', english: 'Delete point', spain: '', color: '', type: 'button' },
        { service: 'close', russian: 'Закрыть', english: 'Close', spain: '', color: '', type: 'button' },
        { service: 'all_cities', russian: 'Все города', english: 'All cities', spain: '', color: '', type: 'button' },
        { service: 'intercity_only', russian: 'Только межгород', english: 'Intercity only', spain: '', color: '', type: 'button' },
        { service: 'send_code', russian: 'Отправить код', english: 'Send code', spain: '', color: '', type: 'button' },
        { service: 'send_new_code', russian: 'Отправить новый код', english: 'Send new code', spain: '', color: '', type: 'button' },
        { service: 'save_and_sign_in', russian: 'Сохранить и войти', english: 'Save and sign in', spain: '', color: '', type: 'button' },
        { service: 'orders', russian: 'Заказы', english: 'Orders', spain: '', color: '', type: 'button' },
        { service: 'create_order', russian: 'Создать заказ', english: 'Create order', spain: '', color: '', type: 'button' },
        { service: 'carriers', russian: 'Перевозчики', english: 'Carriers', spain: '', color: '', type: 'button' },
        { service: 'customers', russian: 'Заказчики', english: 'Customers', spain: '', color: '', type: 'button' },
        { service: 'account', russian: 'Аккаунт', english: 'Account', spain: '', color: '', type: 'button' },
        { service: 'order_editing', russian: 'Редактирование заказа', english: 'Order editing', spain: '', color: '', type: 'button' },
        { service: 'settings', russian: 'Настройки', english: 'Settings', spain: '', color: '', type: 'button' },
        { service: 'transports', russian: 'Транспорт', english: 'Transports', spain: '', color: '', type: 'button' },
        { service: 'arc_bookmark', russian: 'Архив', english: 'Archived', spain: '', color: 'rgb(210,219,236, 0.8)', type: 'button' },
        { service: 'new_bookmark', russian: 'Новые', english: 'New', spain: '', color: 'rgb(129, 199, 132,0.8)', type: 'button' },
        { service: 'postponed_bookmark', russian: 'Отложенные', english: 'Postponed', spain: '', color: 'rgb(241,196,15,0.8)', type: 'button' },
        { service: 'canceled_bookmark', russian: 'Отмененые', english: 'Canceled', spain: '', color: 'rgb(254, 111, 103,0.8)', type: 'button' },
        { service: 'completed_bookmark', russian: 'Выполненые', english: 'Completed', spain: '', color: 'rgb(214,232,255,0.8)', type: 'button' },
        { service: 'inWork_bookmark', russian: 'В работе', english: 'In work', spain: '', color: 'rgb(254, 145, 40,0.8)', type: 'button' },
        { service: 'templates_bookmark', russian: 'Шаблоны', english: 'Templates', spain: '', color: 'rgb(254, 145, 40,0.8)', type: 'button' },
        { service: 'select_all', russian: 'Выбрать все', english: 'Select all', spain: '', color: '', type: 'button' },
        { service: 'reset', russian: 'Сбросить', english: 'Reset', spain: '', color: '', type: 'button' },
        { service: 'just_favorites', russian: 'Только избранное', english: 'Just favorites', spain: '', color: '', type: 'button' },
        { service: 'clear_favorites', russian: 'Очистить избранное', english: 'Clear favorites', spain: '', color: '', type: 'button' },
        { service: 'reset_favorites', russian: 'Все', english: 'All', spain: '', color: '', type: 'button' },
        { service: 'back_to_order_list', russian: 'вернуться к списку заказов', english: 'back to order list', spain: '', color: '', type: 'button' },
        { service: 'select', russian: 'Выбрать', english: 'Select', spain: '', color: '', type: 'button' },
        { service: 'deselect', russian: 'Отменить выбор', english: 'Deselect', spain: 'Deselect', color: '', type: 'button' },
        { service: 'to_favorites', russian: 'Добавить избранное', english: 'Add to favorites', spain: '', color: '', type: 'button' },
        { service: 'from_favorites', russian: 'Убрать из избранного', english: 'Remove from favorites', spain: '', color: '', type: 'button' },
        { service: 'send_activation_link', russian: 'Отправить ссылку', english: 'Send new link', spain: '', color: '', type: 'button' },
        { service: 'rate', russian: 'Оценить', english: 'Rate', spain: '', color: '', type: 'button' },
        { service: 'rate_customer', russian: 'Оцените заказчика', english: 'Rate the customer', spain: '', color: '', type: 'button' },
        { service: 'rate_carrier', russian: 'Оцените перевозчика', english: 'Rate the carrier', spain: '', color: '', type: 'button' },
        { service: 'add', russian: 'Добавить', english: 'Add', spain: '', color: '', type: 'button' },
        { service: 'add_point', russian: 'добавить точку', english: 'add point', spain: '', color: '', type: 'button' },
        { service: 'partners_list', russian: 'Список', english: 'List', spain: '', color: '', type: 'button' },
        { service: 'groups', russian: 'Группы', english: 'Groups', spain: '', color: '', type: 'button' },
        { service: 'add_partner_by_id', russian: 'Добавить партнера по id', english: 'Add partner by id', spain: '', color: '', type: 'button' },
        { service: 'partner_to_normal', russian: 'Удалить из избранного', english: 'Delete from favorite', spain: '', color: '', type: 'button' },
        { service: 'partner_to_blocked', russian: 'Заблокировать', english: 'Block', spain: '', color: '', type: 'button' },
        { service: 'partner_from_blocked', russian: 'Разблокировать', english: 'Unblock', spain: '', color: '', type: 'button' },
        { service: 'partner_to_favorite', russian: 'В избранное', english: 'To favorites', spain: '', color: '', type: 'button' },
        { service: 'clear', russian: 'Очистить', english: 'Clear', spain: '', color: '', type: 'button' },
        { service: 'subscribe', russian: 'Оформить', english: 'Subscribe', spain: '', color: '', type: 'button' },
        { service: 'renew', russian: 'Продлить', english: 'Renew', spain: '', color: '', type: 'button' },
        { service: 'switch', russian: 'Перейти', english: 'Switch', spain: '', color: '', type: 'button' },
        { service: 'intercity_only', russian: 'Только межгород', english: 'Intercity only', spain: '', color: '', type: 'button' },
        { service: 'all_cities', russian: 'Все города', english: 'All cities', spain: '', color: '', type: 'button' },
        { service: 'calculate_route', russian: 'Рассчитать  маршрут', english: 'Calculate route', spain: '', color: '', type: 'button' },
        { service: 'clear_route', russian: 'Очистить маршрут', english: 'Clear route', spain: '', color: '', type: 'button' },
        { service: 'go_to_order', russian: 'Перейти к заказу', english: 'Go to order', spain: '', color: '', type: 'notification' },
        { service: 'go_to_auction', russian: 'Перейти к аукциону', english: 'Go to auction', spain: '', color: '', type: 'notification' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'button' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'button' },

        { service: 'default', russian: 'По умолчанию', english: 'Default', spain: '', color: '', type: 'sorting' },
        { service: 'from_auctions', russian: 'Сначала аукционы', english: 'Auctions at first', spain: '', color: '', type: 'sorting' },
        { service: 'from_orders', russian: 'Сначала заказы', english: 'Orders at first', spain: '', color: '', type: 'sorting' },
        { service: 'latest_status', russian: 'По последнему статусу', english: 'By latest status', spain: '', color: '', type: 'sorting' },
        { service: 'transport_type', russian: 'По типу транспорта', english: 'By type of transport', spain: '', color: '', type: 'sorting' },
        { service: 'ascending_cost', russian: 'По возрастанию стоимости', english: 'Ascending cost', spain: '', color: '', type: 'sorting' },
        { service: 'descending_cost', russian: 'По убыванию стоимости', english: 'Descending cost', spain: '', color: '', type: 'sorting' },
        { service: 'new_old', russian: 'От новых к старым', english: 'From new to old', spain: '', color: '', type: 'sorting' },
        { service: 'old_new', russian: 'От старых к новым', english: 'From old to new', spain: '', color: '', type: 'sorting' },
        { service: 'sorting', russian: 'Сортировка', english: 'Sorting', spain: '', color: '', type: 'sorting' },
        { service: 'by_partner_name', russian: 'По наименованию', english: 'By name', spain: '', color: '', type: 'sorting' },
        { service: 'rating_up', russian: 'По возрастанию рейтинга', english: 'Rating ascending', spain: '', color: '', type: 'sorting' },
        { service: 'rating_down', russian: 'По убыванию рейтинга', english: 'Rating descending', spain: '', color: '', type: 'sorting' },

        { service: 'filter_id', russian: 'id', english: 'id', spain: '', color: '', type: 'filter' },
        { service: 'adress', russian: 'Адрес', english: 'Adress', spain: '', color: '', type: 'filter' },
        { service: 'partner', russian: 'Партнер', english: 'Partner', spain: '', color: '', type: 'filter' },
        { service: 'cost_from', russian: 'Стоимость от', english: 'Cost from', spain: '', color: '', type: 'filter' },
        { service: 'cost_to', russian: 'стоимость до', english: 'cost to', spain: '', color: '', type: 'filter' },
        { service: 'date_from', russian: 'Дата от', english: 'Date from', spain: '', color: '', type: 'filter' },
        { service: 'date_to', russian: 'дата до', english: 'date to', spain: '', color: '', type: 'filter' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'filter' },        

        { service: 'carriers_office', russian: 'Кабинет перевозчика', english: 'Сarrier`s office', spain: '', color: '', type: 'header' },
        { service: 'customers_office', russian: 'Кабинет заказчика', english: 'Customer`s office', spain: '', color: '', type: 'header' },
        { service: 'managers_office', russian: 'Кабинет менеджера', english: 'Managers office', spain: '', color: '', type: 'header' },
        { service: 'administrators_office', russian: 'Кабинет администратора', english: 'Administrator`s office', spain: '', color: '', type: 'header' },
        { service: 'registration', russian: 'Регистрация', english: 'Registration', spain: '', color: '', type: 'header' },
        { service: 'authorization', russian: 'Авторизация', english: 'Authorization', spain: '', color: '', type: 'header' },
        { service: 'password_recovery', russian: 'Восстановление пароля', english: 'Password recovery', spain: '', color: '', type: 'header' },
        { service: 'have_an_account', russian: 'Есть аккаунт? ', english: 'Have an account? ', spain: '', color: '', type: 'header' },
        { service: 'fill_account', russian: 'Заполните аккаунт и начнем', english: 'Fill in your account details and let`s get started.', spain: '', color: '', type: 'header' },
        { service: 'choose_subscription_plan', russian: 'Выберите подходящий тарифный план', english: 'Choose the right plan', spain: '', color: '', type: 'header' },

        { service: 'no_orders', russian: 'Нет заказов', english: 'No orders', spain: '', color: '', type: 'content' },
        { service: 'password', russian: 'Пароль', english: 'Password', spain: '', color: '', type: 'content' },
        { service: 'email', russian: 'email', english: 'email', spain: '', color: '', type: 'content' },
        { service: 'selected_orders', russian: 'Выбрано заказов', english: 'Selected orders', spain: '', color: '', type: 'content' },
        { service: 'to_all', russian: 'Всем', english: 'To all', spain: '', color: '', type: 'content' },
        { service: 'to_group', russian: 'Группе', english: 'To group', spain: '', color: '', type: 'content' },
        { service: 'to_partner', russian: 'Партнеру', english: 'To partner', spain: '', color: '', type: 'content' },
        { service: 'to_you', russian: 'Только вам', english: 'Just for you', spain: '', color: '', type: 'content' },
        { service: 'your_grop', russian: 'Вашей группе', english: 'To your group', spain: '', color: '', type: 'content' },
        { service: 'not_specified', russian: 'Не указана', english: 'Not specified', spain: '', color: '', type: 'content' },
        { service: 'auth_email', russian: 'Электронная почта для авторизации', english: 'Authorization email', spain: '', color: '', type: 'content' },
        { service: 'your_rating', russian: 'Ваш рейтинг', english: 'Your rating', spain: '', color: '', type: 'content' },
        { service: 'name_surname_fathersname_content', russian: 'Фамилию, имя, отчество', english: 'First and last name', spain: '', color: '', type: 'content' },
        { service: 'country_content', russian: 'Cтрана', english: 'Сountry', spain: '', color: '', type: 'content' },
        { service: 'city_content', russian: 'Город', english: 'Сity', spain: '', color: '', type: 'content' },
        { service: 'notification_email_content', russian: 'Email для уведомлений', english: 'Notification email', spain: '', color: '', type: 'content' },
        { service: 'adress_content', russian: 'Адрес', english: 'Postal adress', spain: '', color: '', type: 'content' },
        { service: 'phone_content', russian: 'Телефон', english: 'Phone', spain: '', color: '', type: 'content' },
        { service: 'delivery_for', russian: 'Для чего вам доставка', english: 'Why do you need delivery', spain: '', color: '', type: 'content' },
        { service: 'can_add', russian: 'Партнер может добваить вас с помощью кода', english: 'A partner can add you with a code', spain: '', color: '', type: 'content' },
        { service: 'subscription_status', russian: 'Состояние подписки', english: 'Subscription status', spain: '', color: '', type: 'content' },
        { service: 'company_name_content', russian: 'Название компании', english: 'Company name', spain: '', color: '', type: 'content' },
        { service: 'website_content', russian: 'Сайт компании', english: 'Website', spain: '', color: '', type: 'content' },
        { service: 'company_inn_content', russian: 'ИНН', english: 'Tax number', spain: '', color: '', type: 'content' },
        { service: 'legal_content', russian: 'Вы', english: 'You are', spain: '', color: '', type: 'content' },
        { service: 'passport_number_content', russian: 'Номер паспорта', english: 'Passport number', spain: '', color: '', type: 'content' },
        { service: 'passport_issued_by_content', russian: 'Учреждение выдавшее паспорт', english: 'Passport issuing agency', spain: '', color: '', type: 'content' },
        { service: 'passport_date_of_issue_content', russian: 'Дата выдачи паспорта', english: 'Passport date of issue', spain: '', color: '', type: 'content' },
        { service: 'account_status', russian: 'Статус аккаунта', english: 'Accaunt status', spain: '', color: '', type: 'content' },
        { service: 'completed_orders', russian: 'Завершено заказов', english: 'Completed orders', spain: '', color: '', type: 'content' },
        { service: 'disrupted_orders', russian: 'Сорвано заказов', english: 'Disrupted orders', spain: '', color: '', type: 'content' },
        { service: 'solvency', russian: 'Платежеспособность', english: 'Solvency', spain: '', color: '', type: 'content' },
        { service: 'politeness', russian: 'Вежливость', english: 'Politeness', spain: '', color: '', type: 'content' },
        { service: 'number_of_ratings', russian: 'Оценок', english: 'Number of ratings', spain: '', color: '', type: 'content' },
        { service: 'total_rating', russian: 'Итоговый рейтинг', english: 'Total rating', spain: '', color: '', type: 'content' },
        { service: 'loading_unloading', russian: 'Организация погрузки и выгрузки', english: 'Organization of loading and unloading', spain: '', color: '', type: 'content' },
        { service: 'transport_quality', russian: 'Качество транспорта', english: 'Transport quality', spain: '', color: '', type: 'content' },
        { service: 'no_downtime', russian: 'Отсутствие простоя по вине заказчика', english: 'No downtime due to the fault of the customer', spain: '', color: '', type: 'content' },
        { service: 'submission_fulfillment', russian: 'Своевременная подача и выполнение', english: 'Timely submission and fulfillment', spain: '', color: '', type: 'content' },
        { service: 'change_solvency', russian: 'Можно изменить оценку платежеспособности', english: 'You can change the assessment of solvency', spain: '', color: '', type: 'content' },
        { service: 'rate_solvency', russian: 'Можно оценить платежеспособность', english: '', spain: 'You can rate solvency', color: '', type: 'content' },
        { service: 'no_transport', russian: 'Нет траспорта, добавьте, чтобы получать заказы', english: 'No transport, add to receive orders', spain: '', color: '', type: 'content' },
        { service: 'drag_drop_transport', russian: 'Перетащите сюда или выберите фотографии транспорта и экипировки', english: 'Drag and drop here or select photos of transport and equipment', spain: '', color: '', type: 'content' },
        { service: 'drag_drop_order', russian: 'Перетащите сюда или выберите фотографии груза или ориентиры на местности', english: 'Drag and drop here or select cargo photos or landmarks', spain: '', color: '', type: 'content' },
        { service: 'drop_to_upload', russian: 'Отпустите файлы для загрузки', english: 'Drop files to upload', spain: '', color: '', type: 'content' },
        { service: 'partner_normal', russian: 'Нормальный', english: 'Normal', spain: '', color: '', type: 'content' },
        { service: 'partner_blocked', russian: 'Заблокирован', english: 'Blocked', spain: '', color: '', type: 'content' },
        { service: 'partner_favorite', russian: 'В избранном', english: 'Favorite', spain: '', color: '', type: 'content' },
        { service: 'no_groups', russian: 'Нет групп', english: 'No groups', spain: '', color: '', type: 'content' },
        { service: 'legal_partner_info', russian: 'Организационно правовая форма', english: 'Organization legal form', spain: '', color: '', type: 'content' },
        { service: 'type_of_customer_content', russian: 'Вид деятельности', english: 'Kind of activity', spain: '', color: '', type: 'content' },
        { service: 'can_choose_groups', russian: 'Можно выбрать', english: 'You can choose', spain: '', color: '', type: 'content' },
        { service: 'no_ratings', russian: 'Нет оценок', english: 'No ratings', spain: '', color: '', type: 'content' },
        { service: 'no_partners', russian: 'Нет партнеров, они добавятся автоматически из заказов в работе, или добавьте их по id', english: 'There are no partners, they will be added automatically from orders in progress, or add them by id', spain: '', color: '', type: 'content' },
        { service: 'main_slogan', russian: 'Здесь встречаются заказчики и перевозчики', english: 'Meeting place for customers and carriers', spain: '', color: '', type: 'content' },
        { service: 'duration', russian: 'Продолжительность', english: 'Duration', spain: '', color: '', type: 'content' },
        { service: 'distance', russian: 'Расстояние', english: 'Distance', spain: '', color: '', type: 'content' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'content' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'content' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'content' },

        { service: 'status', russian: 'Статус', english: 'Status', spain: '', color: '', type: 'field_name' },
        { service: 'phone', russian: 'Телефон', english: 'Phone', spain: '', color: '', type: 'field_name' },
        { service: 'order_comment', russian: 'Комментарий к заказу', english: 'Order comment', spain: '', color: '', type: 'field_name' },
        { service: 'transport', russian: 'Транспорт', english: 'Transport', spain: '', color: '', type: 'field_name' },
        { service: 'cost', russian: 'Стоимость', english: 'Cost', spain: '', color: '', type: 'field_name' },
        { service: 'available', russian: 'Доступен', english: 'Available', spain: '', color: '', type: 'field_name' },
        { service: 'start', russian: 'Откуда', english: 'Start', spain: '', color: '', type: 'field_name' },
        { service: 'adress_field_name', russian: 'Адрес', english: 'Adress', spain: '', color: '', type: 'field_name' },
        { service: 'finish', russian: 'Последняя точка', english: 'Finish', spain: '', color: '', type: 'field_name' },
        { service: 'time', russian: 'Время', english: 'Time', spain: '', color: '', type: 'field_name' },
        { service: 'order_type', russian: 'Тип заказа', english: 'Order type', spain: '', color: '', type: 'field_name' },
        { service: 'id', russian: 'id', english: 'id', spain: '', color: '', type: 'field_name' },
        { service: 'last_order_status', russian: 'Последний статус', english: 'Last status', spain: '', color: '', type: 'field_name' },
        { service: 'transport_tag_field_name', russian: 'Название', english: 'Name', spain: '', color: '', type: 'content' },
        { service: 'transport_type_field_name', russian: 'Способ доставки', english: 'Transport type', spain: '', color: '', type: 'field_name' },
        { service: 'partner_name', russian: 'Наименование', english: 'Name', spain: '', color: '', type: 'field_name' },
        { service: 'number_of_members', russian: 'Количество участников', english: 'Number of members', spain: '', color: '', type: 'field_name' },
        { service: 'groups_field_name', russian: 'Группы', english: 'Groups', spain: '', color: '', type: 'field_name' },
        { service: 'rating_field_name', russian: 'Рейтинг', english: 'Rating', spain: '', color: '', type: 'field_name' },
        { service: 'arrival_time_field_name', russian: 'Время подачи', english: 'Arrival_time', spain: '', color: '', type: 'field_name' },
        { service: 'points_in_the_order', russian: 'Всего точек в заказе', english: 'Total points in the order', spain: '', color: '', type: 'field_name' },

        { service: 'carrier', russian: 'Перевозчик', english: 'Carrier', spain: '', color: '', type: 'role' },
        { service: 'customer', russian: 'Заказчик', english: 'Customer', spain: '', color: '', type: 'role' },
        { service: 'manager', russian: 'Менеджер', english: 'Manager', spain: '', color: '', type: 'role' },
        { service: 'administrator', russian: 'Администратор', english: 'Administrator', spain: '', color: '', type: 'role' },

        { service: 'not_empty', russian: 'не может быть пустым', english: 'can`t be empty', spain: '', color: '', type: 'validation' },
        { service: 'to_short', russian: 'не может быть короче', english: 'can`t be shorter than', spain: '', color: '', type: 'validation' },
        { service: 'to_long', russian: 'не может быть длиннее', english: 'can`t be longer than', spain: '', color: '', type: 'validation' },
        { service: 'format_error', russian: 'неверного формата', english: 'has wrong format', spain: '', color: '', type: 'validation' },
        { service: 'symbols', russian: 'символов', english: 'symbols', spain: '', color: '', type: 'validation' },
        { service: 'compare_passwords', russian: 'пароли не совпадают', english: 'passwords do not match', spain: '', color: '', type: 'validation' },
        { service: 'select_role', russian: 'выберите роль', english: 'select role', spain: '', color: '', type: 'validation' },
        { service: 'confirmation_code', russian: 'код подтверждения', english: 'confirmation code', spain: '', color: '', type: 'validation' },
        { service: 'select_side_type', russian: 'выберите тип кузова', english: 'select side type', spain: '', color: '', type: 'validation' },
        { service: 'select_load_capacity', russian: 'выберите грузоподъемность', english: 'select load capacity', spain: '', color: '', type: 'validation' },
        { service: 'select_transport_type', russian: 'выберите тип транспорта', english: 'select transport type', spain: '', color: '', type: 'validation' },
        { service: 'invalid_file_format', russian: 'недопустимый формат файла', english: 'invalid file format', spain: '', color: '', type: 'validation' },
        { service: 'invalid_files_format', russian: 'недопустимый формат файлов', english: 'invalid files format', spain: '', color: '', type: 'validation' },
        { service: 'already_there', russian: 'уже есть', english: 'already there', spain: '', color: '', type: 'validation' },
        { service: 'maximum', russian: 'Максимум', english: 'Maximum', spain: '', color: '', type: 'validation' },
        { service: 'images', russian: 'изображений', english: 'images', spain: '', color: '', type: 'validation' },
        { service: 'select_country', russian: 'Выберите страну', english: 'Select country', spain: '', color: '', type: 'validation' },
        { service: 'select_city', russian: 'Выберите город из списка', english: 'Select a city from the list', spain: '', color: '', type: 'validation' },
        { service: 'choose_legal_form', russian: 'выберите правовую форму', english: 'choose legal form', spain: '', color: '', type: 'validation' },
        { service: 'delivery_for_validation', russian: 'выберите для чего вам доставка', english: 'select why do you need delivery', spain: '', color: '', type: 'validation' },
        { service: 'select_adress', russian: 'Выберите адрес из списка', english: 'Select an adress from the list', spain: '', color: '', type: 'validation' },
        { service: 'comment', russian: 'Комментарий', english: 'Сomment', spain: '', color: '', type: 'validation' },
        { service: 'select_order_type', russian: 'выберите тип заказа', english: 'select order type', spain: '', color: '', type: 'validation' },
        { service: 'cost_required', russian: 'введите стоимость, или выберите тип заказа аукцион', english: 'enter price value, or select auction order type', spain: '', color: '', type: 'validation' },
        { service: 'select_group_validation', russian: 'выберите группу', english: 'select group', spain: '', color: '', type: 'validation' },
        { service: 'select_partner_validation', russian: 'выберите партнера', english: 'select partner', spain: '', color: '', type: 'validation' },
        { service: 'comment_cant_be_empty', russian: 'комментарий не может быть пустым', english: 'comment can`t be empty', spain: '', color: '', type: 'validation' },
        { service: 'comment_cannot_be_shorter', russian: 'комментарий не может быть короче', english: 'comment can`t be shorter than', spain: '', color: '', type: 'validation' },
        { service: 'comment_cannot_be_longer', russian: 'комментарий не может быть длиннее', english: '', spain: 'comment can`t be longer than', color: '', type: 'validation' },
        { service: 'arrival_time', russian: 'время подачи не может быть пустым', english: 'arrival time cannot be empty', spain: '', color: '', type: 'validation' },
        { service: 'finish_time', russian: 'время выполнения не может быть пустым', english: 'finish time cannot be empty', spain: '', color: '', type: 'validation' },
        { service: 'id_36', russian: 'длина id должна быть 36 симовлов', english: 'id length must be 36 characters', spain: '', color: '', type: 'validation' },
        { service: 'id_not_empty', russian: 'id не может быть пустым', english: 'id can`t be empty', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'validation' },

        { service: 'your_email', russian: 'Ваш email', english: 'Your email', spain: '', color: '', type: 'place_holder' },
        { service: 'your_password', russian: 'Ваш пароль', english: 'Your password', spain: '', color: '', type: 'place_holder' },
        { service: 'who_are_you', russian: 'Вы заказчик или перевозчик?', english: 'Are you a customer or carrier?', spain: '', color: '', type: 'place_holder' },
        { service: 'password_repeat', russian: 'Пароль еще раз', english: 'Repeat password again', spain: '', color: '', type: 'place_holder' },
        { service: 'Сonfirmation_code', russian: 'Код подтверждения', english: 'Сonfirmation code', spain: '', color: '', type: 'place_holder' },
        { service: 'transport_tag', russian: 'Название иои государственный регистрационный знак', english: 'Name or license plate', spain: '', color: '', type: 'place_holder' },
        { service: 'enter_city', russian: 'Введите город', english: 'Type your city name', spain: '', color: '', type: 'place_holder' },
        { service: 'phone_place_holder', russian: 'Телефон', english: 'Phone', spain: '', color: '', type: 'place_holder' },
        { service: 'legal_place_holder', russian: 'Физическое лицо или бизнес', english: 'Individual or business', spain: '', color: '', type: 'place_holder' },
        { service: 'delivery_for_place_holder', russian: 'Для чего вам доставка', english: 'Why do you need delivery', spain: '', color: '', type: 'place_holder' },
        { service: 'company_name_place_holder', russian: 'Название компании', english: 'Company name', spain: '', color: '', type: 'place_holder' },
        { service: 'website_place_holder', russian: 'Сайт компании', english: 'Website', spain: '', color: '', type: 'place_holder' },
        { service: 'company_inn_place_holder', russian: 'ИНН', english: 'Tax number', spain: '', color: '', type: 'place_holder' },
        { service: 'passport_number_place_holder', russian: 'Номер паспорта', english: 'Passport number', spain: '', color: '', type: 'place_holder' },
        { service: 'passport_issued_by_place_holder', russian: 'Учреждение выдавшее паспорт', english: 'Passport issuing agency', spain: '', color: '', type: 'place_holder' },
        { service: 'passport_date_of_issue_place_holder', russian: 'Дата выдачи паспорта', english: 'Passport date of issue', spain: '', color: '', type: 'place_holder' },
        { service: 'name_surname_fathersname_place_holder', russian: 'Фамилия, имя, отчество', english: 'First and last name', spain: '', color: '', type: 'place_holder' },
        { service: 'adress_place_holder', russian: 'Адрес', english: 'Adress', spain: '', color: '', type: 'place_holder' },
        { service: 'order_type_place_holder', russian: 'Тип заказа', english: 'Order type', spain: '', color: '', type: 'place_holder' },
        { service: 'order_comment_place_holder', russian: 'Комментарий к заказу', english: 'Order comment', spain: '', color: '', type: 'place_holder' },
        { service: 'order_for_all', russian: 'Заказ для всех', english: 'Order for all', spain: '', color: '', type: 'place_holder' },
        { service: 'order_for_group', russian: 'Заказ для группы', english: 'Order for group', spain: '', color: '', type: 'place_holder' },
        { service: 'order_for_partner', russian: 'Заказ для партнера', english: 'Order for partner', spain: '', color: '', type: 'place_holder' },
        { service: 'select_group', russian: 'Выберите группу', english: 'Select group', spain: '', color: '', type: 'place_holder' },
        { service: 'select_partner', russian: 'Выберите партнера', english: 'Select partner', spain: '', color: '', type: 'place_holder' },
        { service: 'enter_plase', russian: 'Введите местоположение', english: 'Enter place', spain: '', color: '', type: 'place_holder' },
        { service: 'enter_id', russian: 'Введите полученный от партнера id', english: 'Enter the id received from the partner', spain: '', color: '', type: 'place_holder' },
        { service: 'group_name', russian: 'Название группы', english: 'Group name', spain: '', color: '', type: 'place_holder' },
        { service: 'enter_a_city_to_track', russian: 'Введите город для отслеживания', english: 'Enter a city to track', spain: '', color: '', type: 'place_holder' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'place_holder' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'place_holder' },

        { service: 'code_sent', russian: 'Код отправлен', english: 'Сode sent', spain: '', color: '', type: 'notification' },
        { service: 'password_changed', russian: 'Пароль изиенен, доступ восстановлен, вы авторизованы', english: 'Password changed, access restored, you are logged in', spain: '', color: '', type: 'notification' },
        { service: 'logged_in', russian: 'Вы авторизованы', english: 'You are logged in', spain: '', color: '', type: 'notification' },
        { service: 'registered', russian: 'Вы зарегистрированы, ссылка для активации аккаунта отрправлена на указанный email', english: 'You are registered, a link to activate your account has been sent to the specified email', spain: '', color: '', type: 'notification' },
        { service: 'new_orders_received', russian: 'Поступили новые заказы:', english: 'New orders received:', spain: '', color: '', type: 'notification' },
        { service: 'new_order_received', russian: 'Поступил новый заказ', english: 'New order received', spain: '', color: '', type: 'notification' },
        { service: 'orders_taken', russian: 'Взяты в работу заказы:', english: 'Orders taken:', spain: '', color: '', type: 'notification' },
        { service: 'order_taken', russian: 'Взят в работу заказ', english: 'Order taken', spain: '', color: '', type: 'notification' },
        { service: 'offers_accepted', russian: 'Вы приняли предложения по аукционам:', english: 'You have accepted offers for auctions:', spain: '', color: '', type: 'notification' },
        { service: 'offer_accepted', russian: 'Вы приняли предложение по аукциону', english: 'You have accepted offer for auction', spain: '', color: '', type: 'notification' },
        { service: 'offers_accepted_carrier', russian: 'Приняты ваши предложения по аукционам:', english: 'Customers accepted your offers for auctions:', spain: '', color: '', type: 'notification' },
        { service: 'offer_accepted_carrier', russian: 'Принято ваше предложение по аукциону', english: '', spain: 'Customer accepted your offer for auction', color: '', type: 'notification' },
        { service: 'start_doing', russian: 'можете приступать к выполнению', english: '', spain: 'you can start doing', color: '', type: 'notification' },
        { service: 'postponed_orders', russian: 'Отложены заказы:', english: 'Postponed orders:', spain: '', color: '', type: 'notification' },
        { service: 'postponed_order', russian: 'Отложен заказ', english: 'Postponed order:', spain: '', color: '', type: 'notification' },
        { service: 'restored_orders', russian: 'Вы восстановили заказы:', english: 'You have restored orders:', spain: '', color: '', type: 'notification' },
        { service: 'restored_order', russian: 'Вы восстановили заказ', english: 'You have restored order', spain: '', color: '', type: 'notification' },
        { service: 'check_restored', russian: 'он находится в отложенных, можете отправить его после проверки', english: 'it is in postponed, you can send it after verification', spain: '', color: '', type: 'notification' },
        { service: 'orders_canceled', russian: 'Отменены заказы:', english: 'Canceled orders:', spain: '', color: '', type: 'notification' },
        { service: 'order_canceled', russian: 'Отменен заказ', english: 'Canceled order:', spain: '', color: '', type: 'notification' },
        { service: 'not_loading', russian: 'В связи с незагрузкой', english: 'Due to not loading', spain: '', color: '', type: 'notification' },
        { service: 'non_arrival', russian: 'В связи с не подачей', english: 'Due to non-arrival', spain: '', color: '', type: 'notification' },
        { service: 'affect_your_rating', russian: 'обратите внимание, это влияет на ваш рейтинг', english: 'please note that this will affect your rating', spain: '', color: '', type: 'notification' },
        { service: 'affect_carrier_rating', russian: 'Это повлияет на рейтинг перевозчика', english: 'This will affect the rating of the carrier', spain: '', color: '', type: 'notification' },
        { service: 'affect_customer_rating', russian: 'Это повлияет на рейтинг заказчика', english: 'This will affect the rating of the customer', spain: '', color: '', type: 'notification' },
        { service: 'restore_to_resend', russian: 'восстановите его для повторной отправки', english: 'restore it to resend the order', spain: '', color: '', type: 'notification' },
        { service: 'canceled_disrupted_orders', russian: 'Вы отменили сорванные заказы:', english: 'You canceled disrupted orders:', spain: '', color: '', type: 'notification' },
        { service: 'canceled_disrupted_order', russian: 'Вы отменили сорванный заказ', english: 'You canceled disrupted order', spain: '', color: '', type: 'notification' },
        { service: 'completed_orders', russian: 'Завершены заказы:', english: 'Completed orders:', spain: '', color: '', type: 'notification' },
        { service: 'completed_order', russian: 'Завершен заказ', english: 'Completed order:', spain: '', color: '', type: 'notification' },
        { service: 'customer_completed_orders', russian: 'Заказчик завершил заказы:', english: 'The customer completed orders:', spain: '', color: '', type: 'notification' },
        { service: 'customer_completed_order', russian: 'Заказчик завершил заказ', english: 'The customer completed order:', spain: '', color: '', type: 'notification' },
        { service: 'new_offers', russian: 'Поступили новые предложения к аукционам', english: 'New offers for auctions', spain: '', color: '', type: 'notification' },
        { service: 'changed_offers', russian: 'Измемены предложения к аукционам', english: 'Changed offers for auctions', spain: '', color: '', type: 'notification' },
        { service: 'removed_offers', russian: 'Удалены предложения к аукционам', english: 'Removed offers for auctions', spain: '', color: '', type: 'notification' },
        { service: 'new_offer', russian: 'Поступило новое предложение к аукциону', english: 'New offer for auction', spain: '', color: '', type: 'notification' },
        { service: 'changed_offer', russian: 'Измемено предложение к аукциону', english: 'Changed offer for auction', spain: '', color: '', type: 'notification' },
        { service: 'removed_offer', russian: 'Удалено предложение к аукциону', english: 'Removed offer for auction', spain: '', color: '', type: 'notification' },
        { service: 'order_notifications', russian: 'Заказ', english: 'Order', spain: '', color: '', type: 'notification' },
        { service: 'orders_notifications', russian: 'Заказы:', english: 'Orders:', spain: '', color: '', type: 'notification' },
        { service: 'auction_notifications', russian: 'Аукцион', english: 'Auction', spain: '', color: '', type: 'notification' },
        { service: 'auctions_notifications', russian: 'Аукционы:', english: 'Auctions:', spain: '', color: '', type: 'notification' },
        { service: 'converted_one', russian: 'преобразован', english: 'converted', spain: '', color: '', type: 'notification' },
        { service: 'converted_many', russian: 'преобразованы', english: 'converted', spain: '', color: '', type: 'notification' },
        { service: 'can_take_it', russian: 'вы можете взять в работу на текущих условиях', english: 'you can take it on current terms', spain: '', color: '', type: 'notification' },
        { service: 'to_order', russian: 'в заказ', english: 'to order', spain: '', color: '', type: 'notification' },
        { service: 'to_auction', russian: 'в аукцион', english: 'to auction', spain: '', color: '', type: 'notification' },
        { service: 'canceled_point', russian: 'Отменена точка', english: 'Canceled point', spain: '', color: '', type: 'notification' },
        { service: 'canceled_points', russian: 'Отменены точки:', english: 'Canceled points:', spain: '', color: '', type: 'notification' },
        { service: 'completed_point', russian: 'Завершена точка', english: 'Completed point', spain: '', color: '', type: 'notification' },
        { service: 'postponed_point', russian: 'Отложена точка', english: 'Postponed point', spain: '', color: '', type: 'notification' },
        { service: 'postponed_points', russian: 'Отложены точки', english: 'Postponed points    ', spain: '', color: '', type: 'notification' },
        { service: 'completed_points', russian: 'Завершены точки:', english: 'Completed points:', spain: '', color: '', type: 'notification' },
        { service: 'restored_point', russian: 'Восстановлена точка', english: 'Restored point', spain: '', color: '', type: 'notification' },
        { service: 'restored_points', russian: 'Восстановлены точки:', english: 'Restored points:', spain: '', color: '', type: 'notification' },
        { service: 'in_work_point', russian: 'Взята в работу точка', english: 'Taken into work point', spain: '', color: '', type: 'notification' },
        { service: 'in_work_points', russian: 'Взяты в работу точки', english: 'Taken into work points', spain: '', color: '', type: 'notification' },
        { service: 'on_order', russian: 'по заказу', english: '', spain: 'on order', color: '', type: 'notification' },
        { service: 'on_auction', russian: 'по аукциону', english: '', spain: 'on auction', color: '', type: 'notification' },
        { service: 'on_orders', russian: 'по заказам', english: 'on orders:', spain: '', color: '', type: 'notification' },
        { service: 'you_converted', russian: 'Вы преобразовали', english: 'You converted', spain: '', color: '', type: 'notification' },
        { service: 'you_postponed', russian: 'Вы отложили', english: 'You have postponed', spain: '', color: '', type: 'notification' },
        { service: 'you_restored', russian: 'Вы восстановили', english: 'You have restored', spain: '', color: '', type: 'notification' },
        { service: 'you_canceled', russian: 'Вы отменили', english: 'You have canceled', spain: '', color: '', type: 'notification' },
        { service: 'you_send', russian: 'Вы отправили', english: 'You have send', spain: '', color: '', type: 'notification' },
        { service: 'you_took', russian: 'Вы взяли в работу', english: 'You have took', spain: '', color: '', type: 'notification' },
        { service: 'you_finished', russian: 'Вы завершили', english: 'You have finished', spain: '', color: '', type: 'notification' },
        { service: 'you_deleted', russian: 'Вы удалили', english: 'You have deleted', spain: '', color: '', type: 'notification' },
        { service: 'you_moved_to_arc', russian: 'в ахиве', english: 'archived', spain: '', color: '', type: 'notification' },
        { service: 'you_opened', russian: 'Вы открыли', english: 'You have opened', spain: '', color: '', type: 'notification' },
        { service: 'the', russian: '', english: 'The', spain: '', color: '', type: 'notification' },
        { service: 'orders_notification', russian: 'Заказы', english: 'Orders', spain: '', color: '', type: 'notification' },
        { service: 'for_editing', russian: 'для редактирования', english: 'for_editing', spain: '', color: '', type: 'notification' },
        { service: 'form_from_order', russian: 'форму из заказа', english: 'form from order', spain: '', color: '', type: 'notification' },
        { service: 'form_from_auction', russian: 'форму из аукциона', english: 'form from auction', spain: '', color: '', type: 'notification' },
        { service: 'form_from_template', russian: 'форму из шаблона', english: 'form from template', spain: '', color: '', type: 'notification' },
        { service: 'check_restored_arc', russian: 'проверьте доступность для партнеров и время в заказе перед отправкой', english: 'check the availability for partners and the time in the order before sending', spain: '', color: '', type: 'notification' },
        { service: 'name_surname_fathersname', russian: 'фамилию, имя, отчество', english: 'first and last name', spain: '', color: '', type: 'notification' },
        { service: 'country', russian: 'страну', english: 'country', spain: '', color: '', type: 'notification' },
        { service: 'city', russian: 'город и адрес', english: 'city', spain: '', color: '', type: 'notification' },
        { service: 'company_inn', russian: 'ИНН', english: 'tax number', spain: '', color: '', type: 'notification' },
        { service: 'company_name', russian: 'название компании', english: 'company name', spain: '', color: '', type: 'notification' },
        { service: 'company_adress', russian: 'адрес', english: 'adress', spain: '', color: '', type: 'notification' },
        { service: 'website', russian: 'сайт компании', english: 'website', spain: '', color: '', type: 'notification' },
        { service: 'legal', russian: 'организационно правовую форму', english: 'organization legal form', spain: '', color: '', type: 'notification' },
        { service: 'passport_issued_by', russian: 'учреждение выдавшее паспорт', english: 'passport issuing agency', spain: '', color: '', type: 'notification' },
        { service: 'passport_date_of_issue', russian: 'дату выдачи паспорта', english: 'passport date of issue', spain: '', color: '', type: 'notification' },
        { service: 'passport_number', russian: 'номер паспорта', english: 'passport number', spain: '', color: '', type: 'notification' },
        { service: 'phone', russian: 'телефон', english: 'phone', spain: '', color: '', type: 'notification' },
        { service: 'type_of_customer', russian: 'вид деятельности', english: 'kind of activity', spain: '', color: '', type: 'notification' },
        { service: 'email', russian: 'email для уведомлений', english: 'notification email', spain: '', color: '', type: 'notification' },
        { service: 'authEmail', russian: 'email для авторизации, на него отправлена ссылка для подтверждения аккаунта', english: 'email for authorization, a link was sent to it to verify the account', spain: '', color: '', type: 'notification' },
        { service: 'rated_carrier', russian: 'Вы оценили заказчика', english: 'You have rated carrier', spain: '', color: '', type: 'notification' },
        { service: 'rated_customer', russian: 'Вы оценили перевозчика', english: 'You have rated customer', spain: '', color: '', type: 'notification' },
        { service: 'rated_customer_solvency', russian: 'Вы оценили платежеспособность заказчика', english: 'You have rated customer solvency', spain: '', color: '', type: 'notification' },
        { service: 'rated_carrier_solvency', russian: 'Вы оценили платежеспособность перевозчика', english: 'You have rated carrier solvency', spain: '', color: '', type: 'notification' },
        { service: 'order_editing_canceled', russian: 'Редактирование заказа отменено', english: 'Order editing canceled', spain: '', color: '', type: 'notification' },
        { service: 'auction_editing_canceled', russian: 'Редактирование аукциона отменено', english: 'Auction editing canceled', spain: '', color: '', type: 'notification' },
        { service: 'point_limit', russian: 'Лимит колличества точек в заказе с вашей подпиской', english: 'Point limit per order with your subscription is', spain: '', color: '', type: 'notification' },
        { service: 'you_can_change_subscription', russian: 'Вы можете изменть подписку в разделе аккаунт', english: 'You can change your subscription in the account section', spain: '', color: '', type: 'notification' },
        { service: 'edited', russian: 'Отредактирован', english: 'Edited', spain: '', color: '', type: 'notification' },
        { service: 'created_and_send', russian: 'создан и отправлен', english: 'created and send', spain: '', color: '', type: 'notification' },
        { service: 'created_and_postponed', russian: 'создан и отложен', english: 'created and postponed', spain: '', color: '', type: 'notification' },
        { service: 'created', russian: 'Создан', english: 'Created', spain: '', color: '', type: 'notification' },
        { service: 'partner_added', russian: 'Вы добавили партнера', english: 'You have added a partner', spain: '', color: '', type: 'notification' },
        { service: 'group_created', russian: 'Вы создали группу', english: 'Created group:', spain: '', color: '', type: 'notification' },
        { service: 'group_deleted', russian: 'Вы удалили группу', english: 'Deleted group:', spain: '', color: '', type: 'notification' },
        { service: 'you_added', russian: 'Вы добавили', english: 'You have added', spain: '', color: '', type: 'notification' },
        { service: 'you_blocked', russian: 'Вы заблокировали', english: 'You have blocked', spain: '', color: '', type: 'notification' },
        { service: 'you_have_changed_status', russian: 'Вы изменили статус', english: 'You have changed status of', spain: '', color: '', type: 'notification' },
        { service: 'customer_notification', russian: 'заказчика', english: 'customer', spain: '', color: '', type: 'notification' },
        { service: 'carrier_notification', russian: 'перевозчика', english: 'carrier', spain: '', color: '', type: 'notification' },
        { service: 'to_favorite_notification', russian: 'в избранное', english: 'to favorites', spain: '', color: '', type: 'notification' },
        { service: 'to_normal_notification', russian: 'на наормальный', english: 'to normal', spain: '', color: '', type: 'notification' },
        { service: 'reason_of_cancellation', russian: 'Укажите причину в комментарии', english: 'State your reason in a comment', spain: '', color: '', type: 'notification' },
        { service: 'last', russian: 'последнюю', english: 'last', spain: '', color: '', type: 'notification' },
        { service: 'point', russian: 'точку', english: 'point', spain: '', color: '', type: 'notification' },
        { service: 'of_order', russian: 'заказа', english: 'of order', spain: '', color: '', type: 'notification' },
        { service: 'subscription_cities_limit', russian: 'Вы достигли лимта городов для отслеживания заказов доступного с вашей подпиской. Вы можете проверить и изменить план в разделе аккаунт', english: 'You have reached the limit of cities for tracking orders available with your subscription. You can check and change the plan in the account section', spain: '', color: '', type: 'notification' },
        { service: 'city_already_added', russian: 'Вы уже добавили город отслеживания заказов', english: 'You have already added an order tracking city:', spain: '', color: '', type: 'notification' },
        { service: 'added_order_tracking_city', russian: 'Добавлен город отслеживания заказов', english: 'Added order tracking city', spain: '', color: '', type: 'notification' },
        { service: 'no_need_to_add', russian: 'Нет необходимости добавлять', english: 'No need to add', spain: '', color: '', type: 'notification' },
        { service: 'your_default_city', russian: ', это ваш город по умолчанию', english: ', this is your default city', spain: '', color: '', type: 'notification' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'notification' },
        // { service: '', russian: '', english: '', spain: '', color: '', type: 'notification' },   
    ]

    for (const row of translation) {
        Translation.findOrCreate({
            where: {
                service: row.service, russian: row.russian, english: row.english, spain: row.spain, color: row.color, type: row.type
            }
        })
    }

    // let plans = [
    //     { service_id: 1, name: 'none', value: 'none', bage: '', comment: '', price: '', country: 'russia', frequency: '', period: 0 },
    //     { service_id: 2, name: 'free', value: 'free', bage: '30 дней', comment: 'free', price: '0', country: 'russia', frequency: 'month', period: 31 },
    //     { service_id: 3, name: 'standart', value: 'standart_month', bage: 'Месяц', comment: 'free', price: '299', country: 'russia', frequency: 'month', period: 31 },
    //     { service_id: 4, name: 'standart', value: 'standart_year', bage: 'Год', comment: 'free', price: '2899', country: 'russia', frequency: 'year', period: 365 },
    //     { service_id: 5, name: 'professional', value: 'professional_month', bage: 'Месяц', comment: 'free', price: '599', country: 'russia', frequency: 'month', period: 31 },
    //     { service_id: 6, name: 'professional', value: 'professional_year', bage: 'Год', comment: 'free', price: '5799', country: 'russia', frequency: 'month', period: 365 },
    // ]

    // let options = [
    //     { service_id: 1, name: '6 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 6, type: 'order' },
    //     { service_id: 2, name: '3 предложения по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 3, type: 'offer' },
    //     { service_id: 3, name: '3 заказа в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 3, type: 'take_order' },
    //     { service_id: 4, name: '20 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 20, type: 'order' },
    //     { service_id: 5, name: '10 предложений по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 10, type: 'offer' },
    //     { service_id: 6, name: '10 заказав в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 10, type: 'take_order' },
    //     { service_id: 7, name: '100 заказов за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'customer', limit: 100, type: 'order' },
    //     { service_id: 8, name: '50 предложений по аукционам за 24 часа', comment: 'Отсчет с первого предложения в текущие сутки', value: '', role: 'carrier', limit: 50, type: 'offer' },
    //     { service_id: 9, name: '50 заказов в работу за 24 часа', comment: 'Отсчет с первого заказа в текущие сутки', value: '', role: 'carrier', limit: 50, type: 'take_order' },
    //     { service_id: 10, name: 'Заказы в городе', comment: 'Возможность размещать аказы на расстоянии до 10 километров от центра города', value: '', role: 'customer', limit: 10, type: 'order_range' },
    //     { service_id: 11, name: 'Заказы в городе', comment: 'Возможность размещать заказы на расстоянии до 20 километров от центра города', value: '', role: 'customer', limit: 20, type: 'order_range' },
    //     { service_id: 12, name: 'Заказы в стране', comment: 'Возможность управлять радиусом поиска адресов и размещать заказы по всей стране', value: '', role: 'customer', limit: 10000, type: 'order_range' },
    //     { service_id: 13, name: 'Заказы в городе', comment: 'Возможность отслеживать заказы в вашем городе', value: '', role: 'carrier', limit: 0, type: 'order_range' },
    //     { service_id: 14, name: 'Заказы в стране', comment: 'Возможность выбирать до 5 городов для отслеживания заказов', value: '', role: 'carrier', limit: 5, type: 'order_range' },
    //     { service_id: 15, name: 'Заказы в стране', comment: 'Возможность выбирать до 10 городов для отслеживания заказов', value: '', role: 'carrier', limit: 10, type: 'order_range' },
    //     { service_id: 16, name: '5 адресов в заказе', comment: 'Возможность включить в один заказ до 5 адресов', value: '', role: 'customer', limit: 5, type: 'point_limit' },
    //     { service_id: 17, name: '10 адресов в заказе', comment: 'Возможность включить в один заказ до 10 адресов', value: '', role: 'customer', limit: 10, type: 'point_limit' },
    //     { service_id: 18, name: '50 адресов в заказе', comment: 'Возможность включить в один заказ до 50 адресов', value: '', role: 'customer', limit: 50, type: 'point_limit' },
    // ]

    let options_pattern = [
        { service_id: 1, name: 'orders_within_24_hours', comment: 'countdown_from', value: '', role: 'customer', limit: 6, type: 'order', country: '' },
        { service_id: 2, name: 'auction_offers_in_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 3, type: 'offer', country: '' },
        { service_id: 3, name: 'take_orders_within_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 3, type: 'take_order', country: '' },
        { service_id: 4, name: 'orders_within_24_hours', comment: 'countdown_from', value: '', role: 'customer', limit: 20, type: 'order', country: '' },
        { service_id: 5, name: 'auction_offers_in_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 10, type: 'offer', country: '' },
        { service_id: 6, name: 'take_orders_within_24_hours', comment: 'countdown_from', value: '', role: 'carrier', limit: 10, type: 'take_order', country: '' },
        { service_id: 7, name: 'orders_within_24_hours', comment: 'сountdown_from', value: '', role: 'customer', limit: 100, type: 'order', country: '' },
        { service_id: 8, name: 'auction_offers_in_24_hours', comment: 'сountdown_from', value: '', role: 'carrier', limit: 50, type: 'offer', country: '' },
        { service_id: 9, name: 'take_orders_within_24_hours', comment: 'сountdown_from', value: '', role: 'carrier', limit: 50, type: 'take_order', country: '' },
        { service_id: 10, name: 'orders_in_the_city', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 10, type: 'order_range', country: '' },
        { service_id: 11, name: 'orders_in_the_city', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 20, type: 'order_range', country: '' },
        { service_id: 12, name: 'orders_in_the_country', comment: 'ability_to_place_orders', value: '', role: 'customer', limit: 10000, type: 'order_range', country: '' },
        { service_id: 13, name: 'orders_in_the_city', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 0, type: 'order_range', country: '' },
        { service_id: 14, name: 'orders_in_the_country', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 5, type: 'order_range', country: '' },
        { service_id: 15, name: 'orders_in_the_country', comment: 'number_of_tracking_cities', value: '', role: 'carrier', limit: 10, type: 'order_range', country: '' },
        { service_id: 16, name: 'points_in_order', comment: 'points_in_order', value: '', role: 'customer', limit: 5, type: 'point_limit', country: '' },
        { service_id: 17, name: 'points_in_order', comment: 'points_in_order', value: '', role: 'customer', limit: 10, type: 'point_limit', country: '' },
        { service_id: 18, name: 'points_in_order', comment: 'points_in_order', value: '', role: 'customer', limit: 50, type: 'point_limit', country: '' },
    ]

    let plans_pattern = [
        { service_id: 1, name: 'none', value: 'none', bage: '', comment: '', price: '', country: 'russia', frequency: '', period: 0 },
        { service_id: 2, name: 'free', value: 'free', bage: '30_days', comment: 'free', price: '0', country: 'russia', frequency: 'month', period: 31, country: '' },
        { service_id: 3, name: 'standart', value: 'standart_month', bage: 'month', comment: 'free', price: '299', country: 'russia', frequency: 'month', period: 31, country: '' },
        { service_id: 4, name: 'standart', value: 'standart_year', bage: 'year', comment: 'free', price: '2899', country: 'russia', frequency: 'year', period: 365, country: '' },
        { service_id: 5, name: 'professional', value: 'professional_month', bage: 'month', comment: 'free', price: '599', country: 'russia', frequency: 'month', period: 31, country: '' },
        { service_id: 6, name: 'professional', value: 'professional_year', bage: 'year', comment: 'free', price: '5799', country: 'russia', frequency: 'month', period: 365, country: '' },
    ]

    let subscriptions = [
        { plan_id: 1, price: '', country: 'russia' },
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
        { plan_id: 1, price: '', country: 'canada' },
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

    // слить вместе для внесения в базу

    let plans = []
    let options = []

    for (const option of options_pattern) {
        // ищем в подписке, по всем что нашли проходим и напушиваем в опции
    }

    for (const plan of plans_pattern) {
        // ищем в подписке, по всем что нашли проходим и напушиваем в планы
    }

    // поменять на креэйт апдейт
    for (const row of plans) {
        SubscriptionPlan.findOrCreate({
            where: {
                service_id: row.service_id, name: row.name, value: row.value, bage: row.bage, comment: row.comment, country: row.country, frequency: row.frequency, period: row.period, price: row.price, country: row.country
            }
        })
    }
    for (const row of options) {
        SubscriptionOption.findOrCreate({
            where: {
                service_id: row.service_id, name: row.name, comment: row.comment, value: row.value, role: row.role, limit: row.limit, type: row.type, country: row.country
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
        { value: 'russia', default_language: 'rissian', google_code: 'RU', currency: 'RUB' },
        { value: 'greece', default_language: '', google_code: 'GR', currency: 'RUB' },
        { value: 'canada', default_language: 'english', google_code: 'CA', currency: 'CAD' },
        { value: 'spain', default_language: '', google_code: 'ES', currency: 'RUB' },
        { value: 'sweden', default_language: '', google_code: 'SE', currency: 'RUB' },
        { value: 'finland', default_language: '', google_code: 'FI', currency: 'RUB' },
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















