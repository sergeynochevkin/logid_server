const { Transport, Order } = require('../models/models')
const ApiError = require('../exceptions/api_error')
const { Op, where } = require("sequelize")
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const translateService = require('../service/translate_service')
const sharp = require('sharp')
const { check } = require('express-validator')

class FileController {

    upload = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const { id, option, action } = req.body
                const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'
                // action === 'update' && fs.rmSync(`./uploads/transport/${id}`, { recursive: true, force: true });
                action !== 'update' && fs.mkdirSync(path, { recursive: true })
                cb(null, path)
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + path.extname(file.originalname))
            }
        }),
        limits: { fileSize: '10000000' },
        fileFilter: function (req, file, cb) {
            const { language } = req.body
            const fileTypes = /jpeg|jpg|png|webp/
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
            const { id, option, language, images, action } = req.body

            if (action === 'update' && option === 'transport') {
                let transport = await Transport.findOne({ where: { id } })
                let fileNames = JSON.parse(transport.dataValues.files)
                for (const name of fileNames) {
                    fs.unlink(`./uploads/${option}/${id}/${name}`,
                        err => {
                            if (err) { console.log(err) }
                        })
                }
            }
            if (action === 'update' && option === 'order') {
                let order = await Order.findOne({ where: { id } })
                let fileNames = JSON.parse(order.dataValues.files)
                for (const name of fileNames) {
                    fs.unlink(`./uploads/${option}/${id}/${name}`,
                        err => {
                            if (err) { console.log(err) }
                        })
                }
            }

            // const path = option === 'transport' ? `./uploads/transport/${id}` : option === 'order' ? `./uploads/order/${id}` : './uploads/other'
            let names = req.files.map(file => file.filename);
            let compressed_names = []


            //sharp images here

            sharp.cache(false)

            for (const name of names) {
                //check extention
                let nameArray = name.split('.')
                let ext = nameArray[1]
                let clean_name = nameArray[0]


                //if jpeg, jpg
                if (ext === 'jpeg' || 'jpg') {
                    await sharp(`./uploads/${option}/${id}/${name}`)
                        .withMetadata()
                        .webp({ quality: 30 })
                        .toFile(`./uploads/${option}/${id}/_${clean_name}.webp`);
                }

                //if png
                if (ext === 'png') {
                    await sharp(`./uploads/${option}/${id}/${name}`)
                        .withMetadata()
                        .webp({ quality: 30 })
                        .toFile(`./uploads/${option}/${id}/_${clean_name}.webp`);
                }

                fs.unlink(`./uploads/${option}/${id}/${name}`,
                    err => {
                        if (err) { console.log(err) }
                    })

                compressed_names.push(`_${clean_name}.webp`)
            }

            // edit, attach images paths in array?!
            if (option === 'transport') {
                await Transport.update({ files: JSON.stringify(compressed_names) }, { where: { id: id } })
            }
            if (option === 'order') {
                await Order.update({ files: JSON.stringify(compressed_names) }, { where: { id: id } })
            }

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