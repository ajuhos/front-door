'use strict'

const test    = require('tap'),
      request = require('supertest'),
      onError = require('../../lib/handlers/error'),
      server  = require('http').createServer(listener).listen(onListening),
      html    = /<[^>]*>/,
      err     = new Error('test')

test.plan(5)
test.teardown(() => server.close())

function onListening() {
    request(server)
        .get('/no-error')
        .expect(200, 'no-error', onResponse)

    request(server)
        .get('/only-error')
        .expect(200, 'only-error', onResponse)

    request(server)
        .get('/error-and-open-request')
        .expect(500, html, onResponse)

    request(server)
        .get('/error-and-request-with-sent-headers')
        .expect('x-test', 'test')
        .expect(500, '', onResponse)

    request(server)
        .get('/error-and-finished-request')
        .expect(200, 'error-and-finished-request', onResponse)
}

function listener(req, res) {
    if (req.url === '/no-error') {
        onError(null, req, res)
        res.end('no-error')
    }
    else if (req.url === '/only-error') {
        onError(err)
        res.end('only-error')
    }
    else if (req.url === '/error-and-open-request')
        onError(err, req, res)
    else if (req.url === '/error-and-request-with-sent-headers') {
        res.writeHead(500, { 'x-test': 'test' })
        res.flushHeaders()
        onError(err, req, res)
    }
    else if (req.url === '/error-and-finished-request') {
        res.end('error-and-finished-request')
        onError(err, req, res)
    }
}

function onResponse(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}
