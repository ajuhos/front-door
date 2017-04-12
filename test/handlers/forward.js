'use strict'

const http    = require('http'),
      test    = require('tap'),
      request = require('supertest'),
      forward = require('../../lib/handlers/forward')

const target = http.createServer(listener).listen(onListening)

function listener(req, res) {
    test.equals(req.method, 'POST')
    test.equals(req.url, '/test')

    res.statusCode = 200
    res.setHeader('x-test', 'test')
    res.end('hello world')
}

function proxyListener(req, res) {
    forward(req, res, `http://127.0.0.1:${target.address().port}/test`)
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

            target.close()
            proxy.close()
        })
}
