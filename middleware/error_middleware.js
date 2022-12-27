const ApiError = require('../exceptions/api_error')
const translateService = require('../service/translate_service')

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors })
  }
  return res.status(500).json({ message: translateService.setNativeTranslate('english',
    {
        russian: ['Непредвиденная ошибка', err.message],
        english: ['Unexpected error', err.message]
    }
) })
}