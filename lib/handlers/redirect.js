'use strict'

module.exports = redirect

const statusCodes = require('http').STATUS_CODES,
      escapeHtml  = require('escape-html'),
      accepts     = require('accepts')

function redirect(req, res, target, status) {
    status = status || 302

    const message = statusCodes[ status ]

    let body

    switch (accepts(req).type('html')) {
        case 'html':
            res.setHeader('content-type', 'text/html')

            const u = escapeHtml(target)
            body  = `<p>${message}. Redirecting to <a href="${u}">${u}</a></p>`
            break

        default:
            res.setHeader('content-type', 'text/plain')

            body = message + '. Redirecting to ' + encodeURI(target)
            break
    }

    res.statusCode = status
    res.statusMessage = message
    res.setHeader('location', target)

    // respond
    if (req.method === 'HEAD')
        res.end()
    else {
        res.setHeader('content-length', Buffer.byteLength(body))
        res.end(body)
    }
}
