const Router = require('express')
const router = new Router()
const transportController = require('../controllers/transportController')

router.post('/', transportController.create)
router.get('/', transportController.getAll)
router.get('/:id', transportController.getOne)
router.put('/', transportController.update)
router.delete('/', transportController.delete)

module.exports = router