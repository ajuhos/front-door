'use strict'

const assert     = require('assert'),
      format     = require('strep'),
      TargetList = require('./target-list')

class Target {
    constructor(list, id, href, weight, enabled) {
        assert(list instanceof TargetList, 'list must be an instance of TargetList')
        assert(id, 'id is required ton instantiate a target')
        assert.equal(typeof href, 'string', 'href must be a string')

        this.id      = id
        this.list    = list
        this.href    = format(href)
        this._weight = weight || 1
        this._available = true
        this._enabled = enabled === undefined
            ? true
            : enabled

        list.add(this)
    }

    get weight() {
        return this._weight
    }

    set weight(value) {
        if (value === this._weight)
            return

        this._weight = value

        if (this.list)
            this.list.updateItemWeight(this)
    }

    get available() {
        return this._available
    }

    set available(value) {
        if (value === this._available)
            return

        const enabled = this.enabled

        this._available = value

        if (enabled !== this.enabled && this.list)
            this.list.updateItemState(this)
    }

    get enabled() {
        return this._enabled && this._available
    }

    set enabled(value) {
        if (this._enabled === value)
            return

        const enabled = this.enabled

        this._enabled = value

        if (enabled !== this.enabled && this.list)
            this.list.updateItemState(this)
    }
}

module.exports = Target
