'use strict'

const test = require('tap'),
      hash = require('../../lib/balancers/urlHash'),
      pick = hash(5)

test.equals(pick({ url: '/test?test=test' }), 1)
