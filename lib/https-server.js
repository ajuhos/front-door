'use strict'

const { Server } = require('https'),
      { dispatch, dispatchWebSocket } = require('./handlers/dispatch'),
      sni = require('../lib/handlers/sni')

class FrontDoorHttpsServer extends Server {
    constructor(rules) {
        super({
            SNICallback: (servername, callback) => {
                const ctx = sni(servername, this.rules)

                if (ctx)
                    callback(null, ctx)
                else
                    callback(new Error('certificate not found'))
            }
        })

        this.rules = rules

        this.on('request', this.onRequest.bind(this))
        this.on('upgrade', this.onUpgrade.bind(this))
    }

    onRequest(req, res) {
        dispatch(req, res, this.rules).catch(e => { throw e })
    }

    onUpgrade(req, sock, head) {
        dispatchWebSocket(req, sock, head, this.rules).catch(e => { throw e })
    }
}

module.exports = FrontDoorHttpsServer
