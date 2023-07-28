const Router = require('express')
const router = new Router()
const offerController = require('../controllers/offerController')
const checkRole = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/auth_middleware')

router.post('/', authMiddleware, offerController.create)
router.post('/get_offers', authMiddleware, offerController.getAll)
router.post('/update', authMiddleware, offerController.update)
router.delete('/', authMiddleware, offerController.delete)

module.exports = router