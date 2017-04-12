'use strict'

module.exports = onError

const sendError = require('./send-error')

function onError(err, req, res) {
    if (!err) return

    if (req && res) {
        if ((res.headersSent || res.finished) && res.socket)
            // nothing to do here, so destroy the connection
            res.socket.destroy()
        else if (err.code === 'ECONNREFUSED')
            sendError(req, res, 502, 'The proxy server is unable to connect to an upstream server.')
        else
            sendError(req, res, 500, 'The server encountered an unexpected condition that prevented it from fulfilling the request.')
    }

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
        console.error()
        console.error(err && err.stack || err)
        console.error()
    }
}
