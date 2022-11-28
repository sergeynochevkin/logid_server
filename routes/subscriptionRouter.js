const Router = require('express')
const router = new Router()
const subscriptionController = require('../controllers/SubscriptionController')


router.get('/', subscriptionController.getOne)
router.put('/', subscriptionController.update)

module.exports = router