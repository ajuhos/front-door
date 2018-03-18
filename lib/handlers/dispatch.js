'use strict'

exports = module.exports = dispatch
exports.dispatch = dispatch
exports.dispatchWebSocket = dispatchWebSocket

const sendError = require('./send-error')

async function dispatch(req, res, rules) {
    const host = req.headers[ 'x-forwarded-host' ] || req.headers[ 'host' ]

    if (!host) {
        sendError(req, res, 403, 'Direct IP access not allowed')
        return
    }

    const href = `${host}${req.url}`

    for (let i = 0, l = rules.length; i < l; i++)
        if (await rules[ i ].tryHandle(req, res, href))
            return

    sendError(req, res, 502, 'No upstream server found for the provided host')
}

async function dispatchWebSocket(req, sock, head, rules) {
    const host = req.headers[ 'x-forwarded-host' ] || req.headers[ 'host' ]

    /* istanbul ignore next */
    if (!host) {
        sock.destroy()
        return
    }

    const href = `${host}${req.url}`

    for (let i = 0, l = rules.length; i < l; i++)
        if (await rules[ i ].tryHandleWebSocket(req, sock, head, href))
            return

    sock.destroy()
}
