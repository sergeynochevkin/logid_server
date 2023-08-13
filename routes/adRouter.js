const Router = require('express')
const router = new Router()
const adController = require('../controllers/adController')

router.get('/counters', adController.getMainCountersData)
router.post('/get_transports', adController.getTransports)
router.post('/visit', adController.addVisit)

module.exports = router