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
                const { id, option, action } = req.body
                const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'

                const dirAction = async () => {
                    if (action === 'update') {
                        action === await 'update' && fs.rmSync(`./uploads/transport/${id}`, { recursive: true, force: true }).then(
                            fs.mkdirSync(path, { recursive: true }))
                    } else {
                        fs.mkdirSync(path, { recursive: true })
                    }
                }

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
        .array('files[]', 10);

    async uploadFiles(req, res, next) {
        try {
            const { id, option, language, images } = req.body
            const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'
            let names = req.files.map(file => file.filename);
            // edit, attach images paths in array?!
            await Transport.update({ files: JSON.stringify(names) }, { where: { id: id } })

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

    async getFile(req, res, next) {
        let { type, id, name } = req.query

        res.download(`./uploads/${type}/${id}/${name}`)
    }

    async deleteFile(req, res, next) {

    }

    async updateFile(req, res, next) {

    }




}

module.exports = new FileController()