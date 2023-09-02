const Router = require('express')
const router = new Router()
const userInfoController = require('../controllers/userInfoController')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/', userInfoController.create)
router.get('/', userInfoController.getOne)
router.post('/get_user_infos', auth_middleware, userInfoController.getAll)
router.put('/', auth_middleware, userInfoController.update)
router.put('/location', auth_middleware, userInfoController.updateLocation)
// router.delete('/',)

module.exports = router