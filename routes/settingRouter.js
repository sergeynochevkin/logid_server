const Router = require('express')
const router = new Router()
const settingController = require('../controllers/settingController')

router.get('/', settingController.getAll)
router.put('/',settingController.update)

module.exports = router