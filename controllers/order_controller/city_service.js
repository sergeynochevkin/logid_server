const { UserInfo, UserAppState } = require("../../models/models")

const city_service = async function (userInfoId) {
    let userInfoCity = {
        lat: '',
        lng: '',
        name: ''
    }

    let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
    userInfoCity.lat = parseFloat(userInfo.city_latitude)
    userInfoCity.lng = parseFloat(userInfo.city_longitude)
    userInfoCity.name = userInfo.city

    let cities = []

    state = await UserAppState.findOne({ where: { userInfoId } })
    if (state) {
        state = JSON.parse(state.state)
        if (state.user_map_cities) {
            cities = state.user_map_cities
            cities.push(userInfoCity)
        } else {
            cities.push(userInfoCity)
        }
    } else {
        cities.push(userInfoCity)
    }

    return (
        cities
    )
}

module.exports = {
    city_service
}