const Router = require('express')
const router = new Router()
const subscriptionPriceController = require('../controllers/subscriptionPriceController')

router.post('/',subscriptionPriceController.create)
router.get('/',subscriptionPriceController.getAll)

module.exports = router