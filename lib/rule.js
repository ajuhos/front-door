'use strict'

module.exports = Rule

const assert       = require('assert'),
      forward      = require('./handlers/forward'),
      redirect     = require('./handlers/redirect'),
      authenticate = require('./handlers/authenticate'),
      isFormatted  = /{([0-9]+)}/

function Rule(pattern, target, behavior, credentials) {
    assert(pattern instanceof RegExp, 'pattern must be a RegExp instance')
    assert.equal(typeof target, 'string', 'target must be a string')
    assert(
        behavior === Rule.behavior.forward ||
        behavior === Rule.behavior.redirect,
        'unknown behavior provided'
    )
    if (credentials) {
        assert.equal(typeof credentials, 'object', 'if provided, credentials must be an object')
        assert.equal(typeof credentials.user, 'string', 'credentials.user must be a string')
        assert.equal(typeof credentials.pass, 'string', 'credentials.pass must be a string')
        assert.equal(typeof credentials.realm, 'string', 'credentials.realm must be a string')
    }

    this.target      = target
    this.pattern     = pattern
    this.behavior    = behavior
    this.credentials = credentials
    this.formatted   = isFormatted.test(target)
}

Rule.prototype.match = function match(url) {
    if (this.formatted) {
        const args = url.match(this.pattern)

        if (!args)
            return

        return format(this.target, args.slice(1))
    }
    else if(this.pattern.test(url))
        return this.target
}

Rule.prototype.tryHandle = function tryHandle(req, res, href) {
    const target = this.match(href)

    if (!target)
        return

    if (this.credentials) {
        const { realm, user, pass } = this.credentials
        authenticate(req, res, realm, user, pass, () => this.handle(req, res, target))
    }
    else
        this.handle(req, res, target)

    return true
}

Rule.prototype.handle = function handle(req, res, target) {
    switch (this.behavior) {
        case Rule.behavior.forward:
            forward(req, res, target)
            break

        case Rule.behavior.redirect:
            redirect(req, res, target)
            break
    }
}

Rule.fromPattern = function fromString(pattern, target, behavior, credentials) {
    let i = 0

    if (!target)
        target = pattern.replace(/\?|\*/g, () => `{${i++}}`)

    pattern = '^' +
        pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '(.+)')
            .replace(/\?/g, '(.*)')
             + '$'

    return new Rule(new RegExp(pattern, 'i'), target, behavior, credentials)
}

Rule.behavior = Object.freeze({
    forward: {},
    redirect: {}
})

function format(str, args) {
    return str.replace(/{([0-9]+)}/g, (_, i) => args[ i ] || '')
}
