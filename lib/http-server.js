'use strict'

const { Server } = require('http'),
      { dispatch, dispatchWebSocket } = require('./handlers/dispatch')

class FrontDoorHttpServer extends Server {
    constructor(rules) {
        super()

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

module.exports = FrontDoorHttpServer
