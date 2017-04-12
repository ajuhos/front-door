'use strict'

module.exports = dispatch

const sendError = require('./send-error')

function dispatch(req, res, rules) {
    const host = req.headers[ 'x-forwarded-host' ] || req.headers[ 'host' ]

    if (!host)
        return sendError(req, res, 403, 'Direct IP access not allowed.')

    const length = rules.length

    for (let i = 0; i < length; i++)
        if (rules[ i ].tryHandle(req, res))
            return

    sendError(req, res, 502, 'No routing configuration found for the provided host.')
}
