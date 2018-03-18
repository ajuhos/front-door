'use strict'

const { Server } = require('http'),
      { dispatch, dispatchWebSocket } = require('./handlers/dispatch'),
      { sendError } = require('./handlers/send-error')

class FrontDoorHttpServer extends Server {
    constructor(rules) {
        super()

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

module.exports = FrontDoorHttpServer
