'use strict'

module.exports = selectByUrl

const hash = require('string-hash')

function selectByUrl(length) {
    return function (req) {
        return hash(req.url) % length
    }
}
