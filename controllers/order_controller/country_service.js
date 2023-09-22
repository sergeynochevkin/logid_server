const { UserInfo, User } = require("../../models/models")

const country_service = async function (userInfoId) {

    let userInfo = await UserInfo.findOne({ where: { id: userInfoId }, include: User })

    return (
        userInfo.user.country
    )
}

module.exports = {
    country_service
}