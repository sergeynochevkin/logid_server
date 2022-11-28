const Router = require('express')
const router = new Router()
const limitController = require('../controllers/limitController')

router.get('/', limitController.getOne)

module.exports = router