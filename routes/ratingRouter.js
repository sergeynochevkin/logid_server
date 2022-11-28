const Router = require('express')
const router = new Router()
const ratingController = require('../controllers/ratingController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/create_order_rating', ratingController.createOrderRating)
router.post('/update_other_rating', ratingController.updateOtherRating)
router.post('/get_order_ratings', ratingController.getAll)
router.post('/get_other_ratings', ratingController.getOtherRatings)
router.post('/get_one_order_rating', ratingController.getOne)
// router.post('/update', ratingController.update)
// router.delete('/',)

module.exports = router