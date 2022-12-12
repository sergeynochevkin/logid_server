const jwt = require('jsonwebtoken')
const translateService = require('../service/translate_service')

module.exports = function (role) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({
                    message: translateService.setTranslate(
                        {
                            russian: ['Пользователь не авторизован'],
                            english: ['User not authorized']
                        }
                    )
                })
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            if (decoded.role !== role) {
                return res.status(403).json({ message: translateService.setTranslate(
                    {
                        russian: ['Нет прав на изменения'],
                        english: ['No rights to change']
                    }
                ) })
            }
            req.user = decoded
            next()
        }
        catch (e) {
            res.status(401).json({
                message: translateService.setTranslate(
                    {
                        russian: ['Пользователь не авторизован'],
                        english: ['User not authorized']
                    }
                )
            })
        }
    }
}










