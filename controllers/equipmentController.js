const { Equipment } = require('../models/models')
const ApiError = require('../exceptions/api_error')

class EquipmentController {
    async create(req, res) {
        const {
            equipment_type
        } = req.body
        const equipment = await Equipment.create({
            equipment_type
        })
        return res.json(equipment)
    }

    async getAll(req, res) {
        const equipment = await Equipment.findAll()
        return res.json(equipment)
    }

    async getOne(req, res) {

    }

    async update(req, res) {

    }

    async delete(req, res) {

    }
}

module.exports = new EquipmentController()