'use strict'

module.exports = selectBySourceIp

const hash = require('string-hash')

function selectBySourceIp(length) {
    return function (req) {
        const ip = req.headers[ 'x-forwarded-for' ] || req.socket.remoteAddress || 'unknown'
        return hash(ip) % length
    }
}
