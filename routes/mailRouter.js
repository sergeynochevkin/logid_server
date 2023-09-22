const Router = require('express')
const router = new Router()
const mailController = require('../controllers/notification_controller/mailController')
const authMiddleware = require('../middleware/auth_middleware')

router.post('/send_mail', authMiddleware, mailController.send)
router.post('/send_capture_form_mail', authMiddleware, mailController.sendCaptureFormMail)


module.exports = router