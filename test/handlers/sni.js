'use strict'

const fs           = require('fs'),
      path         = require('path'),
      https        = require('https'),
      test         = require('tap'),
      sni          = require('../../lib/handlers/sni'),
      Target       = require('../../lib/target'),
      TargetList   = require('../../lib/target-list'),
      ForwardRule  = require('../../lib/rules/forward-rule'),
      RedirectRule = require('../../lib/rules/redirect-rule'),
      certDir      = path.join(__dirname, '..', 'certificates'),
      server       = https.createServer({ SNICallback }, listener).listen(onListening),
      list         = new TargetList,
      target       = new Target(list, 1, 'test.com'),
      rules        = [
          RedirectRule.fromPattern('umbrella', 'example.com'),
          ForwardRule.fromPattern('hooli', list)
      ]

test.plan(4)
test.tearDown(() => server.close())

rules[ 0 ].tlsCredentials = {
    cert: fs.readFileSync(path.join(certDir, 'umbrella.crt')),
    key:  fs.readFileSync(path.join(certDir, 'umbrella.key'))
}

rules[ 1 ].tlsCredentials = {
    cert: fs.readFileSync(path.join(certDir, 'hooli.crt')),
    key:  fs.readFileSync(path.join(certDir, 'hooli.key'))
}

function SNICallback(servername, callback) {
    const ctx = sni(servername, rules)

    if (ctx)
        callback(null, ctx)
    else
        callback(new Error('certificate not found'))
}

function listener(req, res) {
    res.setHeader('host', req.headers.host)
    res.end('ok')
}

function onListening() {
    const opts = server.address()

    // we're using self-signed certificates for testing
    opts.rejectUnauthorized = false

    opts.servername = 'umbrella'
    opts.headers = { host: 'umbrella' }
    https.request(opts, onResponse).end()

    opts.servername = 'hooli'
    opts.headers.host = 'hooli'
    https.request(opts, onResponse).end()

    opts.servername = 'unknown'
    https
        .request(opts, onResponse)
        .on('error', onError)
        .end()
}

function onResponse(res) {
    const cert = res.socket.getPeerCertificate()
    test.equals(res.headers.host, cert.issuer.O)
}

function onError(err) {
    test.ok(err)
    test.equals(err.code, 'ECONNRESET', 'connection should be closed')
}
