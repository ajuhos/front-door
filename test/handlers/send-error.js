'use strict'

const test    = require('tap'),
      request = require('supertest'),
      send    = require('../../lib/handlers/send-error'),
      server  = require('http').createServer(listener).listen(onListening),
      html    = /<[^>]*>/

test.plan(7)
test.tearDown(() => server.close())

function onListening() {
    request(server)
        .get('/')
        .expect('content-type', 'text/html')
        .expect(500, html, onResponse)

    request(server)
        .get('/')
        .set('accept', 'text/*')
        .expect('content-type', 'text/html')
        .expect(500, html, onResponse)

    request(server)
        .get('/')
        .set('accept', 'text/html')
        .expect('content-type', 'text/html')
        .expect(500, html, onResponse)

    request(server)
        .get('/')
        .set('accept', 'text/plain')
        .expect('content-type', 'text/plain')
        .expect(500, '500 - An unexpected condition was encountered. Our service team has been dispatched to bring it back online.', onResponse)

    request(server)
        .get('/test')
        .expect(500, html, onResponse)

    request(server)
        .get('/no-description')
        .set('accept', 'text/html')
        .expect(500, html, onResponse)

    request(server)
        .get('/no-description')
        .set('accept', 'text/plain')
        .expect(500, '500 - Internal Server Error', onResponse)
}

function listener(req, res) {
    if (req.url === '/no-description')
        send(req, res, 500)
    else
        send(req, res, 500, req.url.substring(1) || 'An unexpected condition was encountered. Our service team has been dispatched to bring it back online.')
}

function onResponse(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}