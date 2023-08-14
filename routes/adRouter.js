const Router = require('express')
const router = new Router()
const adController = require('../controllers/adController')
const auth_middleware = require('../middleware/auth_middleware')

router.get('/counters', adController.getMainCountersData)
router.post('/get_transports', adController.getTransports)

router.post('/add_view', adController.addView)
router.post('/add_contact_view', auth_middleware, adController.addContactView)

router.post('/visit', adController.addVisit)

module.exports = router