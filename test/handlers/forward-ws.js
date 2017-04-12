'use strict'

const http = require('http'),
      test = require('tap'),
      WebSocket = require('ws'),
      forward = require('../../lib/handlers/forward').forwardWebSocket,
      proxy = http.createServer(proxyListener).listen(onProxyListening),
      wss = new WebSocket.Server({ port: 4848 })

wss.on('connection', ws => {
    ws.on('message', msg => {
        test.equals(msg, 'test')

        ws.send('test')
    })
})

function proxyListener(req, res) {
    res.end('test')
}

function onUpgrade(req, socket, head) {
    forward(req, socket, head, 'ws://127.0.0.1:4848')
}

function onProxyListening() {
    proxy.on('upgrade', onUpgrade)

    const ws = new WebSocket(`ws://127.0.0.1:${proxy.address().port}`)

    ws.on('open', () =>
        ws.send('test'))

    ws.on('message', (msg) => {
        test.equals(msg, 'test')

        wss.close()
        proxy.close()
    })
}
