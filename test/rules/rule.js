'use strict'

const fs   = require('fs'),
      path = require('path'),
      http = require('http'),
      test = require('tap'),
      Rule = require('../../lib/rules/rule')

test.plan(24)

/* .test() */

test.ok(Rule.fromPattern('*.example.com').test('test.example.com'))
test.notOk(Rule.fromPattern('example.com').test('test.example.com'))

/* .match() */

ok('http://example.com', 'example.com')
ok('example.com', 'example.com')
ok('example.com/', 'example.com')
notOk('example.com', 'example.com/test')
ok('example.com*', 'example.com')
ok('example.com*', 'example.com/test')
ok('example.com*', 'example.com/test?a=b')
notOk('example.com?a=b', 'example.com/test')
notOk('example.com/?a=b', 'example.com/test')
notOk('example.com?a=b', 'example.com/test?a=b')
notOk('example.com/?a=b', 'example.com/test?a=b')
ok('example.com?a=b', 'example.com/?a=b')
ok('example.com/?a=b', 'example.com/?a=b')
ok('example.com/?a=b&c=*', 'example.com/?a=b&c=d')

ok('*.example.com', 'test.example.com')
ok('*.example.com/*/test/*', 'test.example.com/a/test/b')
ok('*.*.example.com/', 'a.b.example.com')

const rule = new Rule(/^example\.com\/user\/profile\?id=([0-9]+)$/i)

test.ok(rule.match('example.com/user/profile?id=42'))

function ok(pattern, href) {
    test.ok(Rule.fromPattern(pattern).match(href))
}

function notOk(pattern, href) {
    test.notOk(Rule.fromPattern(pattern).match(href))
}

/* TLS */

test.equals(rule.tlsCredentials, undefined)
test.equals(rule.tlsSecureContext, undefined)

const cred = {
    cert: fs.readFileSync(path.join(__dirname, '..', 'certificates', 'umbrella.crt')),
    key:  fs.readFileSync(path.join(__dirname, '..', 'certificates', 'umbrella.key'))
}

rule.tlsCredentials = cred

test.equals(rule.tlsCredentials, cred)
test.ok(rule.tlsSecureContext)
