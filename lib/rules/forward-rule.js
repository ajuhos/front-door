'use strict'

const assert       = require('assert'),
      Rule         = require('./rule'),
      TargetList   = require('../target-list'),
      forward      = require('../handlers/forward'),
      sendError    = require('../handlers/send-error'),
      authenticate = require('../handlers/authenticate')

class ForwardRule extends Rule {
    constructor(regexp, targets, credentials) {
        super(regexp)

        assert(targets instanceof TargetList, 'targets must be a TargetList instance')

        if (credentials) {
            assert.equal(typeof credentials, 'object', 'if provided, credentials must be an object')
            assert.equal(typeof credentials.user, 'string', 'credentials.user must be string')
            assert.equal(typeof credentials.pass, 'string', 'credentials.pass must be string')
            assert.equal(typeof credentials.realm, 'string', 'credentials.realm must be string')
        }

        this.targets     = targets
        this.credentials = credentials
    }

    async tryHandle(req, res, href) {
        const args = super.match(href)

        if (!args)
            return

        const target = this.targets.pick(req)

        if (!target) {
            sendError(req, res, 503, 'The proxy server is unable to connect to an upstream server')
            return true
        }

        if (this.credentials) {
            const { realm, user, pass } = this.credentials

            authenticate(req, res, realm, user, pass, () => forward(req, res, target, args))
        }
        else
            forward(req, res, target, args)

        return true
    }

    async tryHandleWebSocket(req, socket, head, href) {
        const args = super.match(href)

        if (!args)
            return

        const target = this.targets.pick(req)

        if (!target)
            socket.destroy()
        else
            forward.forwardWebSocket(req, socket, head, target, args)

        return true
    }
}

module.exports = ForwardRule
