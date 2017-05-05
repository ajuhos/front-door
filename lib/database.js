'use strict'

const fs     = require('fs'),
      path   = require('path'),
      redis  = require('redis'),
      config = require(`./config`)

let client, rearrangeSha

config.on('ready', config => init(config.redis))

function init(options) {
    client = redis.createClient(options)

    client.on('connect', loadScripts)
    client.rearrange = rearrange

    exports.client = client
}

function rearrange(key, position, member, callback) {
    if (!client)
        throw new Error('redis client not initialized')
    else if (!rearrangeSha)
        throw new Error('rearrange script not loaded')

    client.evalsha(rearrangeSha, 1, key, position, member, callback)
}

function loadScripts() {
    fs.readFile(path.resolve(__dirname, 'rearrange.lua'), 'utf8', (err, content) => {
        if (err)
            throw err
        else if (client)
            client.script('load', content, (err, sha) => {
                if (err)
                    throw err
                else
                    rearrangeSha = sha
            })
    })
}
