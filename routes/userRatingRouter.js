const Router = require('express')
const router = new Router()
const userRatingController = require('../controllers/userRatingController')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/',auth_middleware,userRatingController.create)
router.get('/',auth_middleware,userRatingController.getAll)
router.get('/:id',auth_middleware,userRatingController.getOne)
// router.put('/',)
// router.delete('/',)

module.exports = router