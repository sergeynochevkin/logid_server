const Router = require('express')
const notificationController = require('../controllers/notification_controller/notificationController')
const router = new Router()

// router.post('/', notificationController.create)
router.get('/get_notifications', notificationController.getAll)
router.get('/get_notification', notificationController.getOne)
router.put('/update_notifications', notificationController.update)
router.delete('/', notificationController.delete)
router.delete('/delete_all', notificationController.deleteAll)

module.exports = router