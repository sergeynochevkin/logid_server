const Router = require('express')
const router = new Router()
const pointController = require('../controllers/pointController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', pointController.create)
router.post('/get_points', pointController.getAll)
router.post('/update', pointController.update)
// router.delete('/',)

module.exports = router