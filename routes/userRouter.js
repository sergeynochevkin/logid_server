const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/auth_middleware')
const { body } = require('express-validator')

// router.post('/registration', body('email').isEmail(), userController.registration)
router.post('/fast_registration', userController.fast_registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
// router.get('/refresh', userController.refresh)
router.get('/', userController.getOne)

router.put('/update', userController.update)
router.get('/get_code', userController.getCode)
router.put('/restore', userController.restore)
router.get('/restore_link', userController.restore_link)


router.post('/driver_registration', authMiddleware, userController.driver_registration)
router.get('/drivers', authMiddleware, userController.get_drivers)
router.put('/activate_driver', authMiddleware, userController.activate_driver)


module.exports = router


