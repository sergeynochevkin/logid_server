const Router = require('express')
const router = new Router()
const defaultDataController = require('../controllers/defaultDataController')

router.get('/', defaultDataController.getData)

module.exports = router