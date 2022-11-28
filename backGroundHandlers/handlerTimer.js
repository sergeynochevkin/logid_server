module.exports = function (handler, timeout, timeoutUnit, interval, intervalUnit, handlerArgs) {    
    if (timeoutUnit === 'second') {
        timeout = timeout * 1000
    }
    if (timeoutUnit === 'minute') {
        timeout = timeout * 1000 * 60
    }
    if (timeoutUnit === 'hour') {
        timeout = timeout * 1000 * 60 * 60
    }
    if (timeoutUnit === 'day') {
        timeout = timeout * 1000 * 60 * 60 * 12
    }
    if (timeoutUnit === 'month') {
        timeout = timeout * 1000 * 60 * 60 * 12 * 30
    }
    if (intervalUnit === 'second') {
        interval = interval * 1000
    }
    if (intervalUnit === 'minute') {
        interval = interval * 1000 * 60
    }
    if (intervalUnit === 'hour') {
        interval = interval * 1000 * 60 * 60
    }
    if (intervalUnit === 'day') {
        interval = interval * 1000 * 60 * 60 * 12
    }
    if (intervalUnit === 'month') {
        interval = interval * 1000 * 60 * 60 * 12 * 30
    }

    setTimeout(() => {
        setInterval(() => {
            handler(handlerArgs)
        }, interval)
    }, timeout)
}














