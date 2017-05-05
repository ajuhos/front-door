'use strict'

exports = module.exports = forward
exports.forward = forward
exports.forwardWebSocket = forwardWebSocket

const onError = require('./error'),
      proxy   = require('http-proxy').createProxy({ ws: true })

// proxy.on('proxyReq', (proxyReq, req, res) => {
//     const { socket } = proxyReq
//     console.log('req', socket.bytesRead, socket.bytesWritten)
// })

// proxy.on('proxyRes', (proxyRes, req, res) => {
//     const { socket } = proxyRes
//     console.log('res', req.fdTarget, socket.bytesRead, socket.bytesWritten)
// })

function forward(req, res, target, args) {
    const opts = {
        target: target.href(args),
        ignorePath: true
    }

    req.target = target

    proxy.web(req, res, opts, err => onError(err, req, res))
}

function forwardWebSocket(req, socket, head, target, args) {
    const opts = {
        target: target.href(args),
        ignorePath: true
    }

    req.target = target

    proxy.ws(req, socket, head, opts, err => {
        socket.destroy()
        onError(err)
    })
}
