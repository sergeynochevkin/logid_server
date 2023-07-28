const Router = require('express')
const router = new Router()
const transportController = require('../controllers/transportController')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/', auth_middleware,transportController.create)
router.get('/',auth_middleware, transportController.getAll)
router.get('/:id',auth_middleware, transportController.getOne)
router.put('/', auth_middleware,transportController.update)
router.delete('/',auth_middleware,transportController.delete)

module.exports = router