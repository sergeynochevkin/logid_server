const Router = require('express')
const router = new Router()
const managementController = require('../controllers/managementController')

router.get('/get_users', managementController.get_users)

// router.get('/', managementController.getAll)
// router.get('/:id', managementController.getOne)
// router.put('/',)
// router.delete('/', managementController.delete)

module.exports = router