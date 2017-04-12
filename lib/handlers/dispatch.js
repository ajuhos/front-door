'use strict'

exports = module.exports = dispatch
exports.dispatch = dispatch
exports.dispatchWebSocket = dispatchWebSocket

const sendError = require('./send-error')

function dispatch(req, res, rules) {
    const host = req.headers[ 'x-forwarded-host' ] || req.headers[ 'host' ]

    if (!host)
        return sendError(req, res, 403, 'Direct IP access not allowed.')

    const length = rules.length

    for (let i = 0; i < length; i++)
        if (rules[ i ].tryHandle(req, res, host + req.url))
            return

    sendError(req, res, 502, 'No routing configuration found for the provided host.')
}

function dispatchWebSocket(req, socket, head, rules) {
    const host = req.headers[ 'x-forwarded-host' ] || req.headers[ 'host' ]

    /* istanbul ignore next */
    if (!host)
        return socket.destroy()

    const length = rules.length

    for (let i = 0; i < length; i++)
        if (rules[ i ].tryHandleWebSocket(req, socket, head, host + req.url))
            return

    return socket.destroy()
}
