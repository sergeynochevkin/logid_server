const { ServerNotification } = require('../models/models')
const { Op } = require("sequelize")

module.exports = async function () {
    console.log('clean notification started...');
    let notifications
    await ServerNotification.findAll().then(data => {
        notifications = data
    })
    let dateNow = new Date()
    ids = []

    notifications.forEach(element => {
        if (element.createdAt < (dateNow - 86400000)) {
            ids.push(element.id)
        }
    });
    ServerNotification.destroy({ where: { id: { [Op.in]: ids } } })
    console.log('notifications cleaned!');
}















