const Router = require('express')
const router = new Router()
const carriagePriceController = require('../controllers/carriagePriceController')

router.post('/',carriagePriceController.create)
router.get('/',carriagePriceController.getAll)
router.get('/:id',carriagePriceController.getOne)
// router.put('/',)
// router.delete('/',)

module.exports = router