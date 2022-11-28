const Router = require('express')
const router = new Router()
const notificationController = require('../controllers/notificationController')

// router.post('/', notificationController.create)
router.get('/get_notifications', notificationController.getAll)
router.get('/get_notification', notificationController.getOne)
router.put('/update_notifications', notificationController.update)
router.delete('/', notificationController.delete)
router.delete('/delete_all', notificationController.deleteAll)

module.exports = router