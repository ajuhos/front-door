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
        dispatch(req, res, this.rules).catch(e => { 
            console.error(e.stack);
            if(!res.headersSent) {
                sendError(req, res, 500, 'Internal Server Error')
            }
        })
    }

    onUpgrade(req, sock, head) {
        dispatchWebSocket(req, sock, head, this.rules).catch(e => { 
            console.error(e.stack);
            if(!res.headersSent) {
                sendError(req, res, 500, 'Internal Server Error')
            }
        })
    }
}

module.exports = FrontDoorHttpsServer
