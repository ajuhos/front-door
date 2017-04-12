'use strict'

const http         = require('http'),
      test         = require('tap'),
      request      = require('supertest'),
      hash         = require('../../lib/md5'),
      authenticate = require('../../lib/handlers/authenticate'),
      server       = http.createServer(listener).listen(onListening)

test.plan(4)
test.teardown(() => server.close())

function onListening() {
    request(server)
        .get('/test')
        .expect('www-authenticate', 'Basic realm="test"')
        .expect(401, onResponse)

    request(server)
        .get('/test')
        .set('authorization', 'Basic dGVzdDp0ZXN0')
        .expect(200, 'test', onResponse)
}

function listener(req, res) {
    authenticate(req, res, 'test', 'test', hash('test'), onAuthenticated)
}

function onAuthenticated(req, res) {
    test.type(req, http.IncomingMessage)
    test.type(res, http.ServerResponse)

    res.end('test')
}

function onResponse(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}
