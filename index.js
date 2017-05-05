'use strict'

const { version } = require('./package.json'),
      HttpServer  = require('./lib/http-server')

exports = module.exports = HttpServer

Object.assign(exports, {
    HttpServer,
    HttpsServer:  require('./lib/https-server'),
    ForwardRule:  require('./lib/rules/forward-rule'),
    RedirectRule: require('./lib/rules/redirect-rule'),
    TargetList:   require('./lib/target-list'),
    Target:       require('./lib/target'),
    version
})
