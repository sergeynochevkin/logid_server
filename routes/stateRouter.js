const Router = require('express')
const router = new Router()
const stateController = require('../controllers/stateController')

router.post('/', stateController.create)
router.get('/', stateController.getOne)
router.put('/',stateController.update)
router.delete('/', stateController.delete)

module.exports = router