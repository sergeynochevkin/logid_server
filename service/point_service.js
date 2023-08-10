const { UserAppSetting, Order, Point } = require('../models/models')

class PointService {

    async createPoints(pointFormData, userInfoId, newOrderIntegrationId, option) {      
            let points = []

            pointFormData.forEach(element => {
                let {
                    point,
                    latitude,
                    longitude,
                    time,
                    status,
                    sequence,
                    name,
                    customer_comment,
                    carrier_comment,
                    services,
                    updated_by,
                    orderIntegrationId,
                    city
                } = element
                if (option === 'restore') {
                    orderIntegrationId = newOrderIntegrationId
                }

                if (sequence === 1) {
                    Order.update({ start_lat: latitude, start_lng: longitude }, { where: { pointsIntegrationId: orderIntegrationId } })
                }
                if (sequence === 50) {
                    Order.update({ end_lat: latitude, end_lng: longitude }, { where: { pointsIntegrationId: orderIntegrationId } })
                }
                Point.create({
                    point: point.value,
                    latitude,
                    longitude,
                    time: time.value,
                    status,
                    sequence,
                    name,
                    customer_comment: customer_comment.value,
                    carrier_comment,
                    services,
                    updated_by,
                    orderIntegrationId,
                    city
                })
                points.push(element)
            }
            )
            return points        
    }
}

module.exports = new PointService()