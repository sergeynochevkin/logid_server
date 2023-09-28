const { UserInfo, User } = require("../../models/models")

const supervisor_id_service = async function (userInfoId) {

    let userInfo = await UserInfo.findOne({ where: { id: userInfoId }, include: User })
    let supervisor = await User.findOne({ where: { id: userInfo.user.user_id }, include: UserInfo })


    return (
        supervisor.user_info.id
    )
}

module.exports = {
    supervisor_id_service
}