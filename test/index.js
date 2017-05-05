'use strict'

const test        = require('tap'),
      frontdoor   = require('..'),
      { version } = require('../package.json')

test.type(frontdoor, 'function')
test.equals(frontdoor, frontdoor.HttpServer)
test.type(frontdoor.HttpServer, 'function')
test.type(frontdoor.HttpsServer, 'function')
test.type(frontdoor.ForwardRule, 'function')
test.type(frontdoor.RedirectRule, 'function')
test.type(frontdoor.TargetList, 'function')
test.type(frontdoor.Target, 'function')
test.equals(frontdoor.version, version)
