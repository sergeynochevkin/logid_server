const Router = require('express')
const router = new Router()
const mailController = require('../controllers/mailController')

router.post('/send_mail', mailController.send)


module.exports = router