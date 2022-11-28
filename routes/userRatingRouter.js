const Router = require('express')
const router = new Router()
const userRatingController = require('../controllers/userRatingController')

router.post('/',userRatingController.create)
router.get('/',userRatingController.getAll)
router.get('/:id',userRatingController.getOne)
router.put('/',)
router.delete('/',)

module.exports = router