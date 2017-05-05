'use strict'

const http    = require('http'),
      test    = require('tap'),
      request = require('supertest'),
      RR      = require('../../lib/rules/redirect-rule'),
      rule1   = RR.fromPattern('localhost/', 'http://example.com'),
      rule2   = RR.fromPattern('localhost*', 'http://example.com{0}'),
      server  = http.createServer(listener).listen()
      
function listener(req, res) {
    const href = `${req.headers.host}${req.url}`,
          rule = req.method === 'GET'
              ? rule1
              : rule2

    if (!rule.tryHandle(req, res, href))
        res.end('ok')
}

function done(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}

test.plan(4)
test.teardown(() => server.close())

request(server)
    .get('/')
    .set('host', 'test')
    .expect(200, 'ok', done)

request(server)
    .get('/')
    .set('accept', 'text/plain')
    .set('host', 'localhost')
    .expect(302, 'Found. Redirecting to http://example.com', done)

request(server)
    .get('/')
    .set('accept', 'text/plain')
    .set('host', 'localhost')
    .expect(302, 'Found. Redirecting to http://example.com', done)

request(server)
    .post('/test')
    .set('accept', 'text/plain')
    .set('host', 'localhost')
    .expect(302, 'Found. Redirecting to http://example.com/test', done)
