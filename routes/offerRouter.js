const Router = require('express')
const router = new Router()
const offerController = require('../controllers/offerController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', offerController.create)
router.post('/get_offers', offerController.getAll)
router.post('/update', offerController.update)
router.delete('/', offerController.delete)

module.exports = router