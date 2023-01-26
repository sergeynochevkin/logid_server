const Router = require('express')
const router = new Router()
const mailController = require('../controllers/mailController')

router.post('/send_mail', mailController.send)
router.post('/send_capture_form_mail', mailController.sendCaptureFormMail)


module.exports = router