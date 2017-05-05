'use strict'

const test         = require('tap'),
      request      = require('supertest'),
      WebSocket    = require('ws'),
      Server       = require('../lib/http-server'),
      Target       = require('../lib/target'),
      TargetList   = require('../lib/target-list'),
      ForwardRule  = require('../lib/rules/forward-rule'),
      RedirectRule = require('../lib/rules/redirect-rule'),
      targets      = new TargetList,
      target       = new Target(targets, 1, 'ws://127.0.0.1:4848'),
      rules        = [
          RedirectRule.fromPattern('example.com', 'test.com'),
          ForwardRule.fromPattern('example.com', targets)
      ],
      proxy        = new Server(rules).listen(onListening),
      wss          = new WebSocket.Server({ port: 4848 })

test.plan(3)
test.tearDown(() => {
    wss.close()
    proxy.close()
})

wss.on('connection', ws => {
    ws.on('message', msg => {
        test.equals(msg, 'test')

        ws.send('test')
    })
})

function onListening() {
    request(proxy)
        .get('/')
        .set('host', 'example.com')
        .set('accept', 'text/plain')
        .expect(302, 'Found. Redirecting to test.com', err => {
            if (err)
                test.threw(err)
            else
                test.pass('expected answer received')
        })

    const ws = new WebSocket(`ws://127.0.0.1:${proxy.address().port}`, {
        headers: {
            host: 'example.com'
        }
    })

    ws.on('open', () => ws.send('test'))
    ws.on('message', msg => test.equals(msg, 'test'))
}
