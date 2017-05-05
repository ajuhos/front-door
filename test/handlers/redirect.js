'use strict'


const test = require('tap'),
      request = require('supertest'),
      server = require('http').createServer(listener).listen(onListening),
      redirect = require('../../lib/handlers/redirect')

test.plan(9)
test.tearDown(() => server.close())

function listener(req, res) {
    if (req.url === '/permanent')
        redirect(req, res, 'example.com/test', 301)
    else
        redirect(req, res, 'example.com/test')
}

function onListening() {
    // 301 Found

    request(server)
        .get('/')
        .set('accept', 'text/plain')
        .expect('location', 'example.com/test')
        .expect('content-length', '38')
        .expect(302, 'Found. Redirecting to example.com/test', onResponse)

    request(server)
        .get('/')
        .expect('location', 'example.com/test')
        .expect('content-length', '76')
        .expect(302, '<p>Found. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    request(server)
        .get('/')
        .set('accept', 'text/*')
        .expect('location', 'example.com/test')
        .expect('content-length', '76')
        .expect(302, '<p>Found. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    request(server)
        .get('/')
        .set('accept', 'text/html')
        .expect('location', 'example.com/test')
        .expect('content-length', '76')
        .expect(302, '<p>Found. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    // 302 Moved permanently

    request(server)
        .get('/permanent')
        .set('accept', 'text/plain')
        .expect('location', 'example.com/test')
        .expect('content-length', '50')
        .expect(301, 'Moved Permanently. Redirecting to example.com/test', onResponse)

    request(server)
        .get('/permanent')
        .expect('location', 'example.com/test')
        .expect('content-length', '88')
        .expect(301, '<p>Moved Permanently. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    request(server)
        .get('/permanent')
        .set('accept', 'text/*')
        .expect('location', 'example.com/test')
        .expect('content-length', '88')
        .expect(301, '<p>Moved Permanently. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    request(server)
        .get('/permanent')
        .set('accept', 'text/html')
        .expect('location', 'example.com/test')
        .expect('content-length', '88')
        .expect(301, '<p>Moved Permanently. Redirecting to <a href="example.com/test">example.com/test</a></p>', onResponse)

    // HEAD

    request(server)
        .head('/')
        .expect('location', 'example.com/test')
        .expect(302, undefined, onResponse)
}

function onResponse(err) {
    if (err)
        test.threw(err)
    else
        test.pass('expected response received')
}