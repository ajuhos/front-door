'use strict'

module.exports = authenticate

const auth = require('basic-auth'),
      hash = require('../md5'),
      sendError = require('./send-error')

function authenticate(req, res, realm, username, password, callback) {
    const { name, pass } = auth(req) || {}

    if (name === username && password === hash(pass))
        callback(req, res)
    else {
        res.setHeader('www-authenticate', `Basic realm="${realm}"`)
        sendError(req, res, 401, 'The provided authentication credentials were insufficient to grant access to the requested resource.')
    }
}
