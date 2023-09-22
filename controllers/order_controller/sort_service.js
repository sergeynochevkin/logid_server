const sort_service = function (filters, order_status) {

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
    _filters = { ...filters }

    return (
        { sortDirection, sortColumn, _filters }
    )
}

module.exports = {
    sort_service
}