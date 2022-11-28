const notificationHandler = function (previousState, state) {

    let prev = previousState.filter(el => el.order_status === 'new' || el.order_status === 'inWork')
    let actual = state.filter(el => el.order_status === 'new' || el.order_status === 'inWork')
    let added = actual.filter(el => !prev.map(el => el.id).includes(el.id))
    let retrived = prev.filter(el => !actual.map(el => el.id).includes(el.id))

    return (
        added, retrived
    )
}

module.exports = {
    notificationHandler
}
