const { Transport } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op } = require("sequelize")
const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

class FileController {

    upload = multer({
        storage: storage,
        limits: { fileSize: '10000000' },
        fileFilter: function (req, file, cb) {
            const fileTypes = /jpeg|jpg|png/
            const mimeType = fileTypes.test(file.mimetype)
            // const extname = fileTypes.test(file.extname(file.originalname))
            if (mimeType /*&& extname*/) {
                return cb(null, true)
            }
            cb('Не корректные форматы файлов')
        },
    })
        // .single('image')
        .array('images', 10)

    async uploadImages(req, res, next) {
        try {
            const { transportId, path } = req.body
            console.log('files!');
            console.log(req.files);
            // const { path } = req.files; // files для нескольких изображений     
            await Transport.update({ image: path }, { where: { id: transportId } })
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