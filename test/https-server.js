'use strict'

const fs           = require('fs'),
      path         = require('path'),
      https        = require('https'),
      test         = require('tap'),
      WebSocket    = require('ws'),
      Server       = require('../lib/https-server'),
      Target       = require('../lib/target'),
      TargetList   = require('../lib/target-list'),
      ForwardRule  = require('../lib/rules/forward-rule'),
      RedirectRule = require('../lib/rules/redirect-rule'),
      targets      = new TargetList,
      target       = new Target(targets, 1, 'ws://127.0.0.1:4848'),
      rules        = [
          RedirectRule.fromPattern('example.com', 'test.com'),
          ForwardRule.fromPattern('example.com', targets)
      ],
      proxy        = new Server(rules).listen(onListening),
      wss          = new WebSocket.Server({ port: 4848 })

test.plan(6)
test.tearDown(() => {
    wss.close()
    proxy.close()
})

rules[ 0 ].tlsCredentials =
rules[ 1 ].tlsCredentials = {
    cert: fs.readFileSync(path.join(__dirname, 'certificates', 'umbrella.crt')),
    key:  fs.readFileSync(path.join(__dirname, 'certificates', 'umbrella.key'))
}

wss.on('connection', ws => {
    ws.on('message', msg => {
        test.equals(msg, 'test')

        ws.send('test')
    })
})

function onListening() {
    https
        .get({
            host: '127.0.0.1',
            port: proxy.address().port,
            headers: {
                host: 'example.com',
                accept: 'text/plain'
            },
            // we're using self-signed certificates for testing
            rejectUnauthorized: false
        }, onResponse)
        .end()

    https
        .get({
            host: '127.0.0.1',
            port: proxy.address().port,
            headers: {
                host: 'unknown.host'
            },
            // we're using self-signed certificates for testing
            rejectUnauthorized: false
        })
        .on('error', onError)
        .end()

    const ws = new WebSocket(`wss://127.0.0.1:${proxy.address().port}`, {
        headers: {
            host: 'example.com'
        },
        // we're using self-signed certificates for testing
        rejectUnauthorized: false
    })

    ws.on('open', () => ws.send('test'))
    ws.on('message', msg => test.equals(msg, 'test'))
}

function onResponse(res) {
    let data = ''

    res.on('data', chunk => data += chunk)
    res.on('end', () => onEnd(res.statusCode, data))
}

function onEnd(status, data) {
    test.equals(status, 302)
    test.equals(data, 'Found. Redirecting to test.com')
}

function onError(err) {
    test.ok(err)
    test.equals(err.code, 'ECONNRESET', 'connection should be closed')
}
