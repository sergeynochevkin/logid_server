const { User, UserInfo, ServerNotification } = require('../models/models');
const { Op, where } = require("sequelize")

class NotificationService {

    // constructor() {
    //     this.transport = nodemailer.createTransport({
    //         host: process.env.MAIL_HOST,
    //         port: process.env.MAIL_PORT,
    //         secure: true,
    //         auth: {
    //             user: process.env.MAIL_USER,
    //             pass: process.env.MAIL_PASS
    //         },
    //         tls: {
    //             rejectUnauthorized: false
    //         }
    //     })
    // }

    async addManagementNotification(subject, message, members, type) {

        let users = await User.findAll({ where: { id: { [Op.in]: members } } })

        for (const user of users) {
            let userInfo = await UserInfo.findOne({ where: { userId: user.dataValues.id } })
            if (userInfo) {
                await ServerNotification.findOrCreate({
                    where: {
                        userInfoId: userInfo.id,
                        message: message,
                        type: !type ? 'success' : type
                    }
                })
            }
        }
    }
}

module.exports = new NotificationService()