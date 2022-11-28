const Router = require('express')
const router = new Router()
const fileController = require('../controllers/fileController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', fileController.upload, fileController.uploadImages)

module.exports = router