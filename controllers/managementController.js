const { Transport, User, UserInfo } = require('../models/models')
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

            let users = await User.findAll({})
            let userInfos = await UserInfo.findAll({})
            let transports = await Transport.findAll({})

            //clear that i dont need
            let handledUsers = []
            for (const user of users) {
                let userPattern = {
                    id:undefined,
                    email: '',
                    role: '',
                    created_at: '',
                    //maybe more
                    user_info: {},
                    transports: [],
                }
                //add what i need
                userPattern.id = user.id
                userPattern.email = user.email
                userPattern.role = user.role
                userPattern.created_at = user.created_at
                let userInfo = { ...userInfos.find(el => el.userId === user.id) }
                userPattern.user_info = { ...userInfo.dataValues }
                if (user.role === 'carrier' && transports) {
                    userPattern.transports = [...transports.filter(el => el.userInfoId === userInfos.find(el => el.userId === user.id).id)]
                }
                handledUsers.push(userPattern)
            }

            return res.json(handledUsers)
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