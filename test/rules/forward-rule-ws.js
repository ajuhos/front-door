'use strict'

const http        = require('http'),
      test        = require('tap'),
      WebSocket   = require('ws'),
      Target      = require('../../lib/target'),
      TargetList  = require('../../lib/target-list'),
      ForwardRule = require('../../lib/rules/forward-rule'),
      dispatch    = require('../../lib/handlers/dispatch').dispatchWebSocket,
      proxy       = http.createServer(proxyListener).listen(onProxyListening),
      wss         = new WebSocket.Server({ port: 4848 })

test.plan(2)
test.tearDown(() => {
    proxy.close()
    wss.close()
})

function proxyListener(req, res) {
    res.end('test')
}

function onUpgrade(req, socket, head) {
    const list   = new TargetList,
          target = new Target(list, 1, 'ws://127.0.0.1:4848'),
          rules  = [
              ForwardRule.fromPattern('example.com', list)
          ]

    target.available = false

    dispatch(req, socket, head, rules)
}

function onProxyListening() {
    proxy.on('upgrade', onUpgrade)

    const ws = new WebSocket(`ws://127.0.0.1:${proxy.address().port}`, null, {
        headers: {
            host: 'example.com'
        }
    })

    ws.on('error', err => {
        test.ok(err)
        test.equals(err.code, 'ECONNRESET')
    })
}
