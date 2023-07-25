const Router = require('express')
const router = new Router()
const adController = require('../controllers/adController')

router.get('/counters', adController.getMainCountersData)
router.get('/transports', adController.getTransports)

module.exports = router