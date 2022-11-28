class TimeService {

 setTime(initialTime, timeGap, forWhat) {
        timeGap = timeGap * 60000
        const thisTime = new Date(initialTime.getTime() + timeGap)

        if (forWhat === 'show') {
            let handledTime = `${thisTime.getHours() / 10 < 1 ? '0' : ''}${thisTime.getHours()}:${thisTime.getMinutes() / 10 < 1 ? '0' : ''}${thisTime.getMinutes()} ${thisTime.getDate() / 10 < 1 ? '0' : ''}${thisTime.getDate()}.${(thisTime.getMonth() + 1) / 10 < 1 ? '0' : ''}${(thisTime.getMonth() + 1)}.${thisTime.getFullYear()}`
            return handledTime
        }
        if (forWhat === 'form') {
            let handledTime = `${thisTime.getFullYear()}-${(thisTime.getMonth() + 1) / 10 < 1 ? '0' : ''}${thisTime.getMonth() + 1}-${thisTime.getDate() / 10 < 1 ? '0' : ''}${thisTime.getDate()}T${thisTime.getHours() / 10 < 1 ? '0' : ''}${thisTime.getHours()}:${thisTime.getMinutes() / 10 < 1 ? '0' : ''}${thisTime.getMinutes()}`
            return handledTime
        }
    }


}

module.exports = new TimeService()