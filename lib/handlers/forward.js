'use strict'

exports = module.exports = forward
exports.forward = forward
exports.forwardWebSocket = forwardWebSocket

const onError = require('./error'),
      proxy   = require('http-proxy').createProxy({ ws: true })

function forward(req, res, target) {
    const opts = {
        target,
        ignorePath: true
    }

    proxy.web(req, res, opts, err => onError(err, req, res))
}

function forwardWebSocket(req, socket, head, target) {
    const opts = {
        target,
        ignorePath: true
    }

    proxy.ws(req, socket, head, opts, err => {
        socket.destroy()
        onError(err)
    })
}
