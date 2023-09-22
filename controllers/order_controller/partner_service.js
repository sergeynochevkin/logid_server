const { Partner } = require("../../models/models")

const partner_service = async function (userInfoId) {
    let iAmPartner = await Partner.findAll({ where: { partnerUserInfoId: userInfoId } })
    let myPartners = await Partner.findAll({ where: { userInfoId } })

    let iAmBlocked = iAmPartner.filter(el => el.status === 'blocked').map(el => el.partnerUserInfoId)
    let myBlocked = myPartners.filter(el => el.status === 'blocked').map(el => el.userInfoId)
    let myFavorite = myPartners.filter(el => el.status === 'favorite').map(el => el.userInfoId) 

    return (
        { myBlocked, iAmBlocked, myFavorite }
    )
}

module.exports = {
    partner_service
}