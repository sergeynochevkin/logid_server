const { UserInfo, User } = require("../../models/models")

const role_service = async function (userInfoId) {

    let userInfo = await UserInfo.findOne({ where: { id: userInfoId }, include: User })

    return (
        userInfo.user.role
    )
}

module.exports = {
    role_service
}