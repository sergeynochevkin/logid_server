const { Partner, OtherRating, PartnerGroup, PartnerByGroup, UserInfo, User } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize")
const translateService = require('../service/translate_service')

class PartnerController {
    async create(req, res, next) {
        try {
            const {
                userInfoId, partnerUserInfoId, status
            } = req.body
            const partner = await Partner.findOrCreate({
                where: {
                    userInfoId, partnerUserInfoId, status
                }
            }).then(OtherRating.findOrCreate({
                where: {
                    raterUserInfoId: userInfoId,
                    ratedUserInfoId: partnerUserInfoId,
                }
            }))
            return res.json(partner)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async addPartnerByKey(req, res, next) {
        try {
            const {
               language, role, userInfoId, key
            } = req.body

            let newPartner = await UserInfo.findOne({ where: { uuid: key } })
            let newPartnerRole
            if (newPartner) {
                newPartnerRole = await User.findOne({ where: { id: newPartner.userId } })
                newPartnerRole = newPartnerRole.role
            }

            let partner
            let addedPartner

            if (newPartner && (role !== newPartnerRole)) {
                partner = await Partner.findOrCreate({
                    where: {
                        userInfoId, partnerUserInfoId: newPartner.id
                    }
                }).then(OtherRating.findOrCreate({
                    where: {
                        raterUserInfoId: userInfoId,
                        ratedUserInfoId: newPartner.id,
                    }
                }))

                addedPartner = await Partner.findOrCreate({
                    where: {
                        userInfoId: newPartner.id, partnerUserInfoId: userInfoId
                    }
                }).then(OtherRating.findOrCreate({
                    where: {
                        raterUserInfoId: newPartner.id,
                        ratedUserInfoId: userInfoId
                    }
                }))
            }
            else if (role === newPartnerRole) {
                partner = `${role === 'carrier' ? translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы являетесь перевозчиком и не можете добавить перевозчика'],
                        english: ['You are a carrier and cannot add a carrier']
                    }
                ) : translateService.setNativeTranslate(language,
                    {
                        russian: ['Вы являетесь заказчиком и не можете добавить заказчика'],
                        english: ['You are a customer and cannot add a customer']
                    }
                )}`
            }
            else { partner = translateService.setNativeTranslate(language,
                {
                    russian: ['Партнер не найден'],
                    english: ['Partner not found']
                }
            )}
            return res.json(partner)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async createGroup(req, res, next) {
        try {
            const {
                userInfoId, name
            } = req.body
            const group = await PartnerGroup.findOrCreate({
                where: {
                    userInfoId, name
                }
            })
            return res.json(group)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let { userInfoId, partnerUserInfoId } = req.query
            let partner;
            if (userInfoId && !partnerUserInfoId) {
                partner = await Partner.findAll({ where: { userInfoId }, order: ['id'] })
            }
            if (!userInfoId && partnerUserInfoId) {
                partner = await Partner.findAll({ where: { partnerUserInfoId }, order: ['id'] })
            }
            return res.json(partner)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getGroups(req, res, next) {
        try {
            var groups = []
            let { userInfoId, partnerIds } = req.body
            let allGroups = await PartnerGroup.findAll({ where: { userInfoId } })
            let extraObject = { partners: [] }
            const pushGroups = function (item) {
                groups.push(item)
                console.log(groups.map(el => el.id));
            }
            for (const group of allGroups) {
                let currentPartners = await PartnerByGroup.findAll({
                    where: { partnerGroupId: group.id },
                })
                currentPartners = currentPartners.map(el => el.partnerId)

                extraObject.partners = currentPartners
                let groupItem = { ...group, ...extraObject }
                pushGroups(groupItem)
            }
            return res.json(groups)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            let { id, status } = req.body
            await Partner.update({ status }, { where: { id: id } })
            return res.send('updated')
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async deleteGroup(req, res, next) {
        try {
            let { id } = req.query
            await PartnerGroup.destroy({ where: { id: id } })
            await PartnerByGroup.destroy({ where: { partnerGroupId: id } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('deleted')
    }


    async deletePartnerFromGroup(req, res, next) {
        try {
            let { id, groupId } = req.query
            await PartnerByGroup.destroy({ where: { partnerId: id, partnerGroupId: groupId } })
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.send('deleted')
    }


    async updateGroups(req, res, next) {
        try {
            let { userInfoId, partnerId, groupIds } = req.body


            let currentConnections = await PartnerByGroup.findAll({
                where: { partnerId, userInfoId },
            })

            let coneectionsForDestroy = currentConnections.filter(el => !groupIds.includes(el.partnerGroupId)).map(el => el.id)
            let coneectionsForCreate = groupIds.filter(el => !currentConnections.map(el => el.partnerGroupId).includes(el))

            await PartnerByGroup.destroy({ where: { id: { [Op.in]: coneectionsForDestroy } } })

            coneectionsForCreate.forEach(async element => {
                await PartnerByGroup.create({ partnerId: partnerId, partnerGroupId: element, userInfoId })
            });
            return res.send('updated')
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new PartnerController()

