'use strict'

const tls    = require('tls'),
      assert = require('assert')

class Rule {
    constructor(regexp) {
        assert(regexp instanceof RegExp, 'pattern must be a RegExp instance')
        this.regexp = regexp
    }

    set tlsCredentials(credentials) {
        this._tlsCredentials   = credentials
        this._tlsSecureContext = tls.createSecureContext(credentials)
    }

    get tlsCredentials() {
        return this._tlsCredentials
    }

    get tlsSecureContext() {
        return this._tlsSecureContext
    }

    test(href) {
        return this.regexp.test(href)
    }

    match(href) {
        const args = href.match(this.regexp)

        if (args)
            args.shift()

        return args
    }

    static fromPattern(pattern, arg2, arg3) {
        let i = pattern.indexOf('//'),
            host, path, search

        // remove protocol
        if (~i)
            pattern = pattern.substring(i + 2)

        pattern = pattern
            .replace(/\./g, '\\.')  // escape dots
            .replace(/\*/g, '(.*)') // replace wildcards

        // find search start
        i = pattern.indexOf('?')

        if (~i) {
            // extract and escape search
            search = '\\?' + pattern.substring(i + 1)

            // remove search
            pattern = pattern.substring(0, i)
        }
        else
            search = ''

        // find path start
        i = pattern.indexOf('/')

        // separate host and path
        if (~i) {
            host = pattern.substring(0, i)
            path = pattern.substring(i)
        }
        else {
            host = pattern
            path = '/'
        }

        // is path ends with a slash?
        if (path[ path.length - 1 ] === '/')
            // remove trailing slash
            path = path.substring(0, path.length - 2)

        // optionally allow trailing slash
        path += '\\/?'

        return new this(new RegExp('^' + host + path + search + '$', 'i'), arg2, arg3)
    }
}

module.exports = Rule
