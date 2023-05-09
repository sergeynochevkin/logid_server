const Router = require('express')
const router = new Router()
const adController = require('../controllers/adController')

router.get('/main_counters', adController.getMainCountersData)

module.exports = router