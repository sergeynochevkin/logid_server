const Router = require('express')
const router = new Router()
const partnerController = require('../controllers/partnerController')
const checkRole = require('../middleware/checkRoleMiddleware')
const auth_middleware = require('../middleware/auth_middleware')

router.post('/', auth_middleware, partnerController.create)
router.post('/add_partner', auth_middleware, partnerController.addPartnerByKey)
router.post('/create_group', auth_middleware, partnerController.createGroup)
router.post('/update_groups', auth_middleware, partnerController.updateGroups)
router.delete('/delete_group', auth_middleware, partnerController.deleteGroup)
router.delete('/delete_partner_from_group', auth_middleware, partnerController.deletePartnerFromGroup)
router.get('/', auth_middleware, partnerController.getAll)
router.post('/groups', auth_middleware, partnerController.getGroups)
router.post('/update', auth_middleware, partnerController.update)
// router.delete('/',)

module.exports = router