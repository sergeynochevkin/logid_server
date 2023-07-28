const Router = require('express')
const router = new Router()
const settingController = require('../controllers/settingController')
const auth_middleware = require('../middleware/auth_middleware')

router.get('/', auth_middleware,settingController.getAll)
router.put('/',auth_middleware,settingController.update)

module.exports = router