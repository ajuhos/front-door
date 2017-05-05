'use strict'

const http        = require('http'),
      test        = require('tap'),
      request     = require('supertest'),
      Target      = require('../../lib/target'),
      TargetList  = require('../../lib/target-list'),
      ForwardRule = require('../../lib/rules/forward-rule'),
      dispatch    = require('../../lib/handlers/dispatch'),
      server      = http.createServer(listener).listen(onListening),
      proxy       = http.createServer(proxyListener).listen(onListening),
      rules       = []

test.plan(1)
test.tearDown(() => {
    server.close()
    proxy.close()
})

let ready = 0

function listener(req, res) {
    res.end('ok')
}

function proxyListener(req, res) {
    dispatch(req, res, rules)
}

function onListening() {
    if (++ready < 2)
        return

    const targets = new TargetList,
          target1 = new Target(targets, 1, `http://127.0.0.1:${server.address().port}`)

    target1.available = false

    rules.push(ForwardRule.fromPattern('example.com', targets))

    request(proxy)
        .get('/')
        .set('host', 'example.com')
        .set('accept', 'text/plain')
        .expect(503, '503 - The proxy server is unable to connect to an upstream server', err => {
            if (err)
                test.threw(err)
            else
                test.pass('expected response received')
        })
}
