'use strict'

const test = require('tap'),
      Rule = require('../lib/rule'),
      f    = Rule.behavior.forward,
      r    = Rule.behavior.redirect

test.equals(Rule.fromPattern('example.com', null, f).match('example.com'), 'example.com')
test.notOk(Rule.fromPattern('example.com', null, r).match('example.com/test'))
test.equals(Rule.fromPattern('example.com?', null, f).match('example.com'), 'example.com')
test.equals(Rule.fromPattern('example.com?', null, r).match('example.com/test'), 'example.com/test')
test.notOk(Rule.fromPattern('example.com*', null, f).match('example.com'))
test.equals(Rule.fromPattern('example.com*', null, r).match('example.com/test'), 'example.com/test')

test.equals(Rule.fromPattern('example.com', 'google.com', f).match('example.com'), 'google.com')
test.notOk(Rule.fromPattern('example.com', 'google.com', r).match('example.com/test'))
test.equals(Rule.fromPattern('example.com?', 'google.com', f).match('example.com'), 'google.com')
test.equals(Rule.fromPattern('example.com?', 'google.com', r).match('example.com/test'), 'google.com')
test.notOk(Rule.fromPattern('example.com*', 'google.com', f).match('example.com'))
test.equals(Rule.fromPattern('example.com*', 'google.com', r).match('example.com/test'), 'google.com')

test.equals(Rule.fromPattern('example.com?', 'google.com{0}', f).match('example.com'), 'google.com')
test.equals(Rule.fromPattern('example.com?', 'google.com{0}', r).match('example.com/test?a=b'), 'google.com/test?a=b')
test.equals(Rule.fromPattern('*.example.com?', '{0}.google.com{1}', f).match('test.example.com/test?a=b'), 'test.google.com/test?a=b')
test.equals(Rule.fromPattern('*.example.com/*/test/*', '{0}.google.com/{2}/{1}', r).match('test.example.com/a/test/b'), 'test.google.com/b/a')
test.equals(Rule.fromPattern('*.*.example.com?', '{1}.google.com', f).match('a.b.example.com/test'), 'b.google.com')

const rule = new Rule(/^example\.com\/user\/profile\?id=([0-9]+)$/i, 'localhost:8080/api/user/{0}/profile', r)

test.equals(rule.match('example.com/user/profile?id=42'), 'localhost:8080/api/user/42/profile')
