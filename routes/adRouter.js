const Router = require('express')
const router = new Router()
const adController = require('../controllers/adController')

router.get('/counters', adController.getMainCountersData)
router.get('/transports', adController.getTransports)
router.post('/visit', adController.addVisit)

module.exports = router