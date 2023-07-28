const Router = require('express')
const router = new Router()
const ratingController = require('../controllers/ratingController')
const checkRole = require('../middleware/checkRoleMiddleware')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/create_order_rating', auth_middleware, ratingController.createOrderRating)
router.post('/update_other_rating', auth_middleware, ratingController.updateOtherRating)
router.post('/get_order_ratings', auth_middleware, ratingController.getAll)
router.post('/get_other_ratings', auth_middleware, ratingController.getOtherRatings)
router.post('/get_one_order_rating', auth_middleware, ratingController.getOne)
// router.post('/update', ratingController.update)
// router.delete('/',)

module.exports = router