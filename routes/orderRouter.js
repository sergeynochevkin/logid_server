const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/auth_middleware')
const orderController = require('../controllers/order_controller/orderController')

router.post('/', authMiddleware, orderController.create)
router.post('/get_orders', authMiddleware, orderController.getAll)
router.get('/get_order', authMiddleware, orderController.getOne)
router.post('/update', authMiddleware, orderController.update)
router.post('/edit', authMiddleware, orderController.edit)
router.delete('/delete_order', authMiddleware, orderController.delete)

router.post('/set_viewed', authMiddleware, orderController.set_viewed)
router.post('/clear_viewed', authMiddleware, orderController.clear_viewed)

module.exports = router