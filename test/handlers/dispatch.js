'use strict'

const http     = require('http'),
      test     = require('tap'),
      request  = require('supertest'),
      Rule     = require('../../lib/rule'),
      hash     = require('../../lib/md5'),
      dispatch = require('../../lib/handlers/dispatch'),
      proxy    = http.createServer(listener).listen(onListening),
      servers  = [],
      rules    = []

test.plan(10)
test.tearDown(() => {
    proxy.close()
    servers.forEach(server => server.close())
})

createServer('/')
createServer('/test')

rules.push(Rule.fromPattern('example.com?', `http://127.0.0.1:${portOf(0)}{0}`, Rule.behavior.forward))
rules.push(Rule.fromPattern('test.com/redirect', `http://127.0.0.1:${portOf(1)}/redirected`, Rule.behavior.redirect))
rules.push(Rule.fromPattern('test.net/', `http://127.0.0.1:${portOf(0)}/`, Rule.behavior.forward, { realm: 'test', user: 'test', pass: hash('test') }))
rules.push(new Rule(/^test\.com(.*)$/, `http://127.0.0.1:${portOf(1)}{0}`, Rule.behavior.forward))

function onListening() {
    // basic cases

    request(proxy)
        .get('/')
        .set('host', 'example.com')
        .expect(200, 'ok', onResponse)

    request(proxy)
        .get('/test')
        .set('x-forwarded-host', 'test.com')
        .expect(200, 'ok', onResponse)

    request(proxy)
        .get('/redirect')
        .set('host', 'test.com')
        .set('accept', 'text/plain')
        .expect(302, `Found. Redirecting to http://127.0.0.1:${portOf(1)}/redirected`, onResponse)

    // unknown or missing host config

    request(proxy)
        .get('/')
        .set('host', 'unknown-host')
        .set('accept', 'text/plain')
        .expect(502, '502 - No routing configuration found for the provided host.', onResponse)

    request(proxy)
        .get('/')
        .set('host', '')
        .set('accept', 'text/plain')
        .expect(403, '403 - Direct IP access not allowed.', onResponse)

    // authentication

    request(proxy)
        .get('/')
        .set('host', 'test.net')
        .set('accept', 'text/plain')
        .expect('www-authenticate', 'Basic realm="test"')
        .expect(401, '401 - The provided authentication credentials were insufficient to grant access to the requested resource.', onResponse)

    request(proxy)
        .get('/')
        .set('host', 'test.net')
        .set('accept', 'text/plain')
        .set('authorization', 'Basic dGVzdDp0ZXN0')
        .expect(200, 'ok', onResponse)
}

function listener(req, res) {
    dispatch(req, res, rules)
}

function onResponse(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}

function createServer(expectedUrl) {
    const server = http.createServer((req, res) => {
        test.equals(req.url, expectedUrl)
        res.end('ok')
    }).listen()
    servers.push(server)
    return server
}

function portOf(i) {
    return servers[ i ].address().port
}
