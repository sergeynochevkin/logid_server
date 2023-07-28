const Router = require('express')
const router = new Router()
const managementController = require('../controllers/managementController')
const auth_middleware = require('../middleware/auth_middleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.get('/get_users', checkRoleMiddleware('admin'), managementController.get_users)
router.get('/get_orders', checkRoleMiddleware('admin'), managementController.get_orders)
router.get('/get_transports', checkRoleMiddleware('admin'), managementController.get_transports)
router.post('/send_notification', checkRoleMiddleware('admin'), managementController.send_notification)
router.put('/', checkRoleMiddleware('admin'), managementController.updateField)

module.exports = router