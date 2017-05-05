'use strict'

const assert   = require('assert'),
      format   = require('strep'),
      Rule     = require('./rule'),
      redirect = require('../handlers/redirect')

class RedirectRule extends Rule {
    constructor(regexp, href) {
        super(regexp)

        assert.equal(typeof href, 'string', 'href must be a string')

        this.href = format(href)
    }

    tryHandle(req, res, href) {
        const args = super.match(href)

        if (!args)
            return

        redirect(req, res, this.href(args))

        return true
    }

    /* istanbul ignore next */
    tryHandleWebSocket() {
        // this should never happen, however
        // we're unable to redirect a client via a web socket connection
    }
}

module.exports = RedirectRule
