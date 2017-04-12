'use strict'

const test = require('tap'),
      Rule = require('../lib/rule')

test.equals(Rule.fromPattern('example.com').match('example.com'), 'example.com')
test.notOk(Rule.fromPattern('example.com').match('example.com/test'))
test.equals(Rule.fromPattern('example.com?').match('example.com'), 'example.com')
test.equals(Rule.fromPattern('example.com?').match('example.com/test'), 'example.com/test')
test.notOk(Rule.fromPattern('example.com*').match('example.com'))
test.equals(Rule.fromPattern('example.com*').match('example.com/test'), 'example.com/test')

test.equals(Rule.fromPattern('example.com', 'google.com').match('example.com'), 'google.com')
test.notOk(Rule.fromPattern('example.com', 'google.com').match('example.com/test'))
test.equals(Rule.fromPattern('example.com?', 'google.com').match('example.com'), 'google.com')
test.equals(Rule.fromPattern('example.com?', 'google.com').match('example.com/test'), 'google.com')
test.notOk(Rule.fromPattern('example.com*', 'google.com').match('example.com'))
test.equals(Rule.fromPattern('example.com*', 'google.com').match('example.com/test'), 'google.com')

test.equals(Rule.fromPattern('example.com?', 'google.com{0}').match('example.com'), 'google.com')
test.equals(Rule.fromPattern('example.com?', 'google.com{0}').match('example.com/test?a=b'), 'google.com/test?a=b')
test.equals(Rule.fromPattern('*.example.com?', '{0}.google.com{1}').match('test.example.com/test?a=b'), 'test.google.com/test?a=b')
test.equals(Rule.fromPattern('*.example.com/*/test/*', '{0}.google.com/{2}/{1}').match('test.example.com/a/test/b'), 'test.google.com/b/a')
test.equals(Rule.fromPattern('*.*.example.com?', '{1}.google.com').match('a.b.example.com/test'), 'b.google.com')

const rule = new Rule(/^example\.com\/user\/profile\?id=([0-9]+)$/i, 'localhost:8080/api/user/{0}/profile')

test.equals(rule.match('example.com/user/profile?id=42'), 'localhost:8080/api/user/42/profile')
