const Router = require('express')
const router = new Router()
const managementController = require('../controllers/managementController')

router.get('/get_users', managementController.get_users)
router.get('/get_orders', managementController.get_orders)
router.get('/get_transports', managementController.get_transports)
router.post('/send_notification', managementController.send_notification)

module.exports = router