'use strict'

const test = require('tap'),
      hash = require('../../lib/balancers/sourceIpHash'),
      pick = hash(5),
      req  = {
          socket: {},
          headers: {}
      }

test.equals(pick(req), 1)
req.socket.remoteAddress = '2001:4860:a005::68'
test.equals(pick(req), 0)
req.headers[ 'x-forwarded-for' ] = '74.125.127.100'
test.equals(pick(req), 4)
