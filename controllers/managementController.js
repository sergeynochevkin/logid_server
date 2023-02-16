const { Transport, User } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class ManagementController {

    async get_users(req, res, next) {

        // add DTO!

        try {
            // let {
            //     formData
            // } = req.body        

            // let {
            //     type,
            //     load_capacity,
            //     side_type,
            //     userInfoId,
            //     tag,
            //     thermo_bag,
            //     hydraulic_platform,
            //     side_loading,
            //     glass_stand,
            //     refrigerator_minus,
            //     refrigerator_plus,
            //     thermo_van,
            // } = formData     

            let users = await User.findAll({
            })

            return res.json(users)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    // async getAll(req, res, next) {
    //     try {
    //         let { userInfoId } = req.query
    //         let transport;
    //         transport = await Transport.findAll({ where: { userInfoId } })
    //         return res.json(transport)
    //     } catch (e) {
    //         next(ApiError.badRequest(e.message))
    //     }
    // }

    // async getOne(req, res) {

    // }

    // async update(req, res) {

    // }

    // async delete(req, res) {
    //     try {
    //         let { id } = req.query
    //         await Transport.destroy({ where: { id: id } })
    //     }
    //     catch (e) {
    //         next(ApiError.badRequest(e.message))
    //     }
    //     return res.send('deleted')
    // }
}

module.exports = new ManagementController()