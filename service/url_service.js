const { UserAppSetting, Order, Point } = require('../models/models')

class UrlService {

    async createGoogleUrl(pointFormData, type) {
        let googleRouteUrl = {
            origin: '',
            waypoints: '',
            destination: ''
        }
        let route_url = []
        let waypoints = ''
        let fullUrl = ''
        for (const point of pointFormData) {
            let onePoint = `${point.latitude},${point.longitude}`
            route_url.push(onePoint)
        }

        googleRouteUrl = { ...googleRouteUrl, origin: route_url[0], destination: route_url[route_url.length - 1] }

        if (route_url.length > 2) {
            let origin = route_url[0]
            let destination = route_url[route_url.length - 1]
            route_url.shift()
            route_url.pop()
            for (const item of route_url) {
                waypoints = waypoints + item + '|'
            }
            googleRouteUrl = { ...googleRouteUrl, origin: origin, destination: destination, waypoints: waypoints.slice(0, -1) }
        }

        fullUrl = `https://www.google.com/maps/dir/?api=1&origin=${googleRouteUrl.origin}${googleRouteUrl.waypoints ? `&waypoints=${googleRouteUrl.waypoints}` : ''}&destination=${googleRouteUrl.destination}&travelmode=${type === 'bike' ? 'BICYCLING' : type === 'electric_scooter' ? 'BICYCLING' : type === 'walk' ? 'WALKING' : 'DRIVING'}`

        return fullUrl
    }


    async createYandexUrl(pointFormData, type) {
        let yandexRouteUrl = {}
        let fullUrl = ''

        let route_url = ''
        for (const point of pointFormData) {
            let onePoint = `${point.latitude},${point.longitude}`
            route_url = route_url + '~' + onePoint
        }
        yandexRouteUrl = route_url.substring(1)


        fullUrl = `https://yandex.ru/maps/?rtext=${yandexRouteUrl}&rtt=${type === 'bike' ? 'bc' : type === 'electric_scooter' ? 'sc' : type === 'walk' ? 'pd' : 'auto'}`
        return fullUrl
    }







}

module.exports = new UrlService()