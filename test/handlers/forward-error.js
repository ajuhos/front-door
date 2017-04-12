'use strict'

const http    = require('http'),
      test    = require('tap'),
      request = require('supertest'),
      forward = require('../../lib/handlers/forward'),
      html    = /<[^>]*>/

const proxy = http.createServer(proxyListener).listen(onListening)

function proxyListener(req, res) {
    forward(req, res, 'http://127.0.0.1:4444/test')
}

function onListening() {
    request(proxy)
        .post('/test')
        .expect(502, html, err => {
            if (err)
                test.threw(err)
            else
                test.pass('expected response received')

            proxy.close()
        })
}
