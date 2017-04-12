'use strict'

const http = require('http'),
      test = require('tap'),
      WebSocket = require('ws'),
      forward = require('../../lib/handlers/forward').forwardWebSocket,
      proxy = http.createServer(proxyListener).listen(onProxyListening)

test.plan(1)
test.tearDown(() => proxy.close())

function proxyListener(req, res) {
    res.end('test')
}

function onUpgrade(req, socket, head) {
    forward(req, socket, head, 'ws://127.0.0.1:4848')
}

function onProxyListening() {
    proxy.on('upgrade', onUpgrade)

    new WebSocket(`ws://127.0.0.1:${proxy.address().port}`)
        .on('error', err => {
            test.equals(err.code, 'ECONNRESET')
        })
}
