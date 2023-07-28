const Router = require('express')
const router = new Router()
const fileController = require('../controllers/fileController')
const checkRole = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/auth_middleware')

router.post('/', authMiddleware, fileController.upload, fileController.uploadFiles)
router.get('/', fileController.getFile)
router.delete('/', authMiddleware, fileController.deleteFile)
router.put('/', authMiddleware, fileController.updateFile)

module.exports = router