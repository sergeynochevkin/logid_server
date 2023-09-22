const { Transport } = require("../../models/models")
const { transportHandler } = require("../../modules/transportHandler")

const transport_service = async function (userInfoId, role) {
    let transport
    if (role === 'carrier') {
        transport = await Transport.findAll({ where: { userInfoId }, raw: true })
    }
    if (role === 'driver') {
        transport = await Transport.findAll({ where: { driver_id: userInfoId }, raw: true })
    }
    let _types = transport.map(el => el.type).filter(el => el !== null)
    let _load_capacities = transport.map(el => el.load_capacity).filter(el => el !== null)
    let _side_types = transport.map(el => el.side_type).filter(el => el !== null)

    let arrays = transportHandler(_types, _load_capacities, _side_types)

    return (
       arrays
    )
}

module.exports = {
    transport_service
}