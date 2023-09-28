const { OrderRating, UserInfo, OtherRating, Order } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize");
const { supervisor_id_service } = require("../controllers/order_controller/supervisor_id_service")


class RatingController {

    async createOrderRating(req, res, next) {
        try {
            let {
                formData
            } = req.body

            let {
                orderId,
                raterUserInfoId,
                ratedUserInfoId,
                in_time,
                politeness,
                facilities,
                role
            } = formData



            let in_time_amount
            let politeness_amount
            let facilities_amount
            let total_in_time
            let total_politeness
            let total_facilities
            let partnerUserInfo
            let total_rating
            let n
            let orderRating


            const ratingAction = async () => {
                orderRating = await OrderRating.create({
                    orderId,
                    raterUserInfoId,
                    ratedUserInfoId,
                    in_time,
                    politeness,
                    facilities
                })
                    .then(partnerUserInfo = await UserInfo.findOne(({ where: { id: ratedUserInfoId } })))
                    .then(
                        in_time_amount = partnerUserInfo.in_time_amount + 1,
                        politeness_amount = partnerUserInfo.politeness_amount + 1,
                        facilities_amount = partnerUserInfo.facilities_amount + 1,

                        (in_time_amount - 1) === 0 ? total_in_time = in_time :
                            total_in_time = (partnerUserInfo.total_in_time * (in_time_amount - 1) + in_time) / in_time_amount,

                        (politeness_amount - 1) === 0 ? total_politeness = politeness :
                            total_politeness = (partnerUserInfo.total_politeness * (politeness_amount - 1) + politeness) / politeness_amount,

                        (facilities_amount - 1) === 0 ? total_facilities = facilities :
                            total_facilities = (partnerUserInfo.total_facilities * (facilities_amount - 1) + facilities) / facilities_amount,

                        //problem with rating first count
                        n = 3,
                        n = partnerUserInfo.solvency_amount === 0 ? n : n + 1,
                        // n = partnerUserInfo.facilities_amount === 0 ? n : n + 1,
                        // n = partnerUserInfo.in_time_amount === 0 ? n : n + 1,
                        // n = partnerUserInfo.politeness_amount === 0 ? n : n + 1,


                        role === 'customer'  ? total_rating = (total_politeness + total_facilities + total_in_time) / n /10 : total_rating = (total_politeness + total_facilities + total_in_time + partnerUserInfo.total_solvency) / n,

                        await UserInfo.update(
                            {
                                total_in_time,
                                total_politeness,
                                total_facilities,
                                in_time_amount,
                                politeness_amount,
                                facilities_amount,
                                total_rating
                            },
                            {
                                where: { id: ratedUserInfoId }
                            }
                        ),
                    )
            }

            await ratingAction()

            if (role === 'customer') {
                let order = await Order.findOne({ where: { id: orderId }, raw: true })
                if (order.carrierId !== order.driver_id) {
                    ratedUserInfoId = order.driver_id
                    await ratingAction()
                }
            }

            return res.json(orderRating)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async updateOtherRating(req, res, next) {
        try {
            let {
                formData
            } = req.body

            let {
                raterUserInfoId,
                ratedUserInfoId,
                solvency,
                role
            } = formData

            let total_solvency
            let solvency_amount
            let partnerUserInfo
            let partnerOtherRatingdByThisUser
            let otherRating
            let total_rating
            let n

            partnerOtherRatingdByThisUser = await OtherRating.findOne(({ where: { [Op.and]: { raterUserInfoId, ratedUserInfoId } } }))

            otherRating = await OtherRating.update({ solvency }, { where: { [Op.and]: { raterUserInfoId, ratedUserInfoId } } }).then(partnerUserInfo = await UserInfo.findOne(({ where: { id: ratedUserInfoId } })))
                .then(

                    partnerUserInfo.solvency_amount === 0 || (partnerUserInfo.solvency_amount === 1 && partnerOtherRatingdByThisUser.solvency !== 0) ?
                        (total_solvency = solvency, solvency_amount = 1) :
                        partnerUserInfo.solvency_amount === 1 && partnerOtherRatingdByThisUser.solvency === 0 ?
                            (solvency_amount = partnerUserInfo.solvency_amount + 1, total_solvency = (partnerUserInfo.total_solvency + solvency) / solvency_amount)
                            : partnerUserInfo.solvency_amount > 1 && partnerOtherRatingdByThisUser.solvency !== 0 ?
                                (total_solvency = (partnerUserInfo.total_solvency * partnerUserInfo.solvency_amount - partnerOtherRatingdByThisUser.solvency + solvency) / partnerUserInfo.solvency_amount, solvency_amount = partnerUserInfo.solvency_amount)
                                : partnerUserInfo.solvency_amount > 1 && partnerOtherRatingdByThisUser.solvency === 0 ?
                                    (total_solvency = (partnerUserInfo.total_solvency * partnerUserInfo.solvency_amount + solvency) / (partnerUserInfo.solvency_amount + 1), solvency_amount = partnerUserInfo.solvency_amount + 1)
                                    : '',

                    //total rating
                    n = 1,
                    n = partnerUserInfo.facilities_amount === 0 ? n : n + 1,
                    n = partnerUserInfo.in_time_amount === 0 ? n : n + 1,
                    n = partnerUserInfo.total_politeness === 0 ? n : n + 1,

                    total_rating = (Number(partnerUserInfo.total_politeness) + Number(partnerUserInfo.total_facilities) + Number(partnerUserInfo.total_in_time) + Number(total_solvency)) / n,

                    await UserInfo.update(
                        {
                            solvency_amount,
                            total_solvency,
                            total_rating
                        },
                        {
                            where: { id: ratedUserInfoId }
                        }
                    ))
            return res.json(otherRating)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { orderIDs, raterUserInfoId } = req.body
            let orderRatings;
            orderRatings = await OrderRating.findAll({ where: { orderId: orderIDs, raterUserInfoId } })

            return res.json(orderRatings)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOtherRatings(req, res, next) {
        try {
            let { raterUserInfoId } = req.body
            let otherRatings;
            otherRatings = await OtherRating.findAll({ where: { raterUserInfoId } })
            return res.json(otherRatings)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            let { orderId, raterUserInfoId } = req.body
            let orderRating;
            orderRating = await OrderRating.findOne({ where: { orderId: orderId, raterUserInfoId } })

            return res.json(orderRating)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new RatingController()