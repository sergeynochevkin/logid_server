const Router = require('express')
const router = new Router()
const managementController = require('../controllers/managementController')
const auth_middleware = require('../middleware/auth_middleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')

router.get('/get_users', checkRoleMiddleware('admin'), auth_middleware, managementController.get_users)
router.get('/get_orders', checkRoleMiddleware('admin'), auth_middleware, managementController.get_orders)
router.get('/get_transports', checkRoleMiddleware('admin'), auth_middleware, managementController.get_transports)
router.get('/get_visits', checkRoleMiddleware('admin'), auth_middleware, managementController.get_visits)
router.get('/get_clicks', checkRoleMiddleware('admin'), auth_middleware, managementController.get_clicks)
router.get('/get_registrations', checkRoleMiddleware('admin'), auth_middleware, managementController.get_registrations)
router.post('/send_notification', checkRoleMiddleware('admin'), auth_middleware, managementController.send_notification)
router.put('/', auth_middleware, checkRoleMiddleware('admin'), managementController.updateField)

module.exports = router