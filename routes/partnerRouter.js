const Router = require('express')
const router = new Router()
const partnerController = require('../controllers/partnerController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', partnerController.create)
router.post('/add_partner', partnerController.addPartnerByKey)
router.post('/create_group', partnerController.createGroup)
router.post('/update_groups', partnerController.updateGroups)
router.delete('/delete_group', partnerController.deleteGroup)
router.delete('/delete_partner_from_group', partnerController.deletePartnerFromGroup)
router.get('/', partnerController.getAll)
router.post('/groups', partnerController.getGroups)
router.post('/update', partnerController.update)
router.delete('/',)

module.exports = router