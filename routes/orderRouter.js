const Router = require('express')
const router = new Router()
const orderController = require('../controllers/orderController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', orderController.create)
router.post('/get_orders', orderController.getAll)
router.post('/get_order_connections', orderController.getOrderConnections)
router.get('/get_order', orderController.getOne)
router.post('/update', orderController.update)
router.post('/edit', orderController.edit)
router.delete('/delete_order', orderController.delete)

module.exports = router