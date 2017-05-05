'use strict'

const http       = require('http'),
      test       = require('tap'),
      request    = require('supertest'),
      Target     = require('../../lib/target'),
      TargetList = require('../../lib/target-list'),
      forward    = require('../../lib/handlers/forward')

const server = http.createServer(listener).listen(onListening)

function listener(req, res) {
    test.equals(req.method, 'POST')
    test.equals(req.url, '/test')

    res.statusCode = 200
    res.setHeader('x-test', 'test')
    res.end('hello world')
}

function proxyListener(req, res) {
    const list   = new TargetList,
          target = new Target(list, 1, `http://127.0.0.1:${server.address().port}/test`)

    forward(req, res, target)
}

function onListening() {
    const proxy = http.createServer(proxyListener).listen()

    request(proxy)
        .post('/test')
        .expect('x-test', 'test')
        .expect(200, 'hello world', err => {
            if (err)
                test.threw(err)
            else
                test.pass('expected response received')

            server.close()
            proxy.close()
        })
}
