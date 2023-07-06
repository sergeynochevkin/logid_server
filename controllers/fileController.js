const { Transport } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize")
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const translateService = require('../service/translate_service')

class FileController {

    upload = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const { id, option } = req.body
                const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'
                fs.mkdirSync(path, { recursive: true })
                cb(null, path)
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + path.extname(file.originalname))
            }
        }),
        limits: { fileSize: '10000000' },
        fileFilter: function (req, file, cb) {
            const { language } = req.body
            const fileTypes = /jpeg|jpg|png/
            const mimeType = fileTypes.test(file.mimetype)
            // const extname = fileTypes.test(file.extname(file.originalname))
            if (mimeType /*&& extname*/) {
                return cb(null, true)
            }

            // check this notification
            cb(translateService.setNativeTranslate(language,
                {
                    russian: ['Не корректные форматы файлов'],
                    english: ['Incorrect file formats']
                }
            ))
        },
    })
        // .single('image')
        .array('files', 10)

    async uploadImages(req, res, next) {
        try {
            const { id, option, language, images } = req.body
            const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'
            await Transport.update({ image: path }, { where: { id: id } })
            console.log('FILES!');
            console.log(req.files);
            console.log('BODY!');
            console.log(req.body);

            //no need!
            // let filesReady = []
            // function getExtension(filename) {
            //     return filename.split('.').pop()
            // }
            // переименовать файлы по uuid + ext
            // files.forEach(file => {
            //     let fileExtention = getExtension(file.name).toLowerCase()
            //     file.name = uuid.v4 + fileExtention
            //     // перемещение в папку
            //     file.mv(path.resolve(__dirname, '..', 'static', file.name))
            //     filesReady.push(file)
            // });
            // let filesList = JSON.stringify(filesReady.map(el => el.name))

            res.send('uploaded')
        } catch (e) {
            if (e instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                const e = new Error('Multer error');
                next(e)
            } else if (e) {
                // An unknown error occurred when uploading.
                const e = new Error('Server Error')
                next(e)
            }
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new FileController()