const Router = require('express')
const router = new Router()
const managementController = require('../controllers/managementController')
const auth_middleware = require('../middleware/auth_middleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.get('/get_users', auth_middleware, managementController.get_users)
router.get('/get_orders', auth_middleware, managementController.get_orders)
router.get('/get_transports', auth_middleware, managementController.get_transports)
router.post('/send_notification', auth_middleware, managementController.send_notification)
router.put('/', auth_middleware, managementController.updateField)

module.exports = router