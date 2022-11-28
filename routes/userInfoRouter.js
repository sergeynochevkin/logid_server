const Router = require('express')
const router = new Router()
const userInfoController = require('../controllers/userInfoController')

router.post('/',userInfoController.create)
router.get('/',userInfoController.getOne)
router.post('/get_user_infos',userInfoController.getAll)
router.put('/',userInfoController.update)
router.delete('/',)

module.exports = router