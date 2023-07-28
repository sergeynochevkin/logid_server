const Router = require('express')
const router = new Router()
const pointController = require('../controllers/pointController')
const checkRole = require('../middleware/checkRoleMiddleware')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/', auth_middleware, pointController.create)
router.post('/get_points', auth_middleware, pointController.getAll)
router.post('/update', auth_middleware, pointController.update)
// router.delete('/',)

module.exports = router