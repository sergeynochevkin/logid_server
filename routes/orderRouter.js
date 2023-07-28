const Router = require('express')
const router = new Router()
const orderController = require('../controllers/orderController')
const checkRole = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/auth_middleware')

router.post('/', authMiddleware, orderController.create)
router.post('/get_orders', authMiddleware, orderController.getAll)
router.post('/get_order_connections', authMiddleware, orderController.getOrderConnections)
router.get('/get_order', authMiddleware, orderController.getOne)
router.post('/update', authMiddleware, orderController.update)
router.post('/edit', authMiddleware, orderController.edit)
router.delete('/delete_order', authMiddleware, orderController.delete)

router.post('/set_viewed', authMiddleware, orderController.set_viewed)
router.post('/clear_viewed', authMiddleware, orderController.clear_viewed)

module.exports = router