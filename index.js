require('dotenv').config()
const express = require('express');
const cors = require('cors')
const sequelize = require('./db')
const router = require('./routes/index')
const errorHandler = require('./middleware/error_middleware');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const defaultDataHandler = require('./backGroundHandlers/defaultDataHandler');
const changePartnerKeyHandler = require('./backGroundHandlers/changePartnerKeyHandler');
const handlerTimer = require('./backGroundHandlers/handlerTimer');
const changeOrderStatusHandler = require('./backGroundHandlers/changeOrderStatusHandler');
const cleanNotificationsHandler = require('./backGroundHandlers/cleanNotificationsHandler');


const PORT = process.env.PORT || 4000

const app = express()
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use(express.json({limit: '5mb'}))
app.use(express.static(path.resolve(__dirname, 'uploads')))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ limit:'5mb', extended: true  }))
app.use(bodyParser.json({limit: '5mb'}))

handlerTimer(changePartnerKeyHandler, 1, 'hour', 7, 'day')

//в архив отмененные и завершенные + предупреждение
handlerTimer(changeOrderStatusHandler, 2, 'hour', 1, 'day',
    {
        statusArray: ['canceled'],
        newStatus: 'arc',
        actionDelayInDays: 2,
        notificationDelayInDays: 1
    }
)
handlerTimer(changeOrderStatusHandler, 2, 'hour', 1, 'day',
    {
        statusArray: ['completed'],
        newStatus: 'arc',
        actionDelayInDays: 2,
        notificationDelayInDays: 1
    }
)
//отменять новые предложив сменить статус + предупреждение
handlerTimer(changeOrderStatusHandler, 15, 'minute', 15, 'minute', // 15 минут для уведомления о смене типа на аукцион!
    {
        statusArray: ['new'],
        newStatus: 'canceled',
        actionDelayInDays: 2,
        notificationDelayInDays: 1
    }
)
// завершать в работе + предупреждение
handlerTimer(changeOrderStatusHandler, 1, 'hour', 1, 'day',
    {
        statusArray: ['inWork'],
        newStatus: 'completed',
        actionDelayInDays: 1,
        notificationDelayInDays: 2
    }
)
// удалить уведомления старщше суток, сутки захардкодил
handlerTimer(cleanNotificationsHandler, 30, 'minute', 1, 'day', {})

app.use('/api', router)

//обработка ошибок последний Middleware
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`))
    }
    catch (e) {
        console.log(e)
    }
}
start()
setTimeout(() => {
    defaultDataHandler()
}, 3000)




