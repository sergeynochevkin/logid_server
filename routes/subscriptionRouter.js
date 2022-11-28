const Router = require('express')
const router = new Router()
const subscriptionController = require('../controllers/subscriptionController')


router.get('/', subscriptionController.getOne)
router.put('/', subscriptionController.update)

module.exports = router