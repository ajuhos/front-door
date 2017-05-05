'use strict'

const assert       = require('assert'),
      random       = require('wrg'),
      roundRobin   = require('wror'),
      urlHash      = require('./balancers/urlHash'),
      sourceIpHash = require('./balancers/sourceIpHash')

class TargetList {
    constructor(balancingMethod) {
        this.items         = []
        this.enabledItems  = []
        this.disabledItems = []
        this.weights = []

        if (balancingMethod) {
            assert(
                balancingMethod === TargetList.balancingMethod.random ||
                balancingMethod === TargetList.balancingMethod.urlHash ||
                balancingMethod === TargetList.balancingMethod.roundRobin ||
                balancingMethod === TargetList.balancingMethod.sourceIpHash,
                'unknown balancing method provided'
            )

            this._balancingMethod = balancingMethod
        }
        else
            this._balancingMethod = TargetList.balancingMethod.roundRobin
    }

    get balancingMethod() {
        return this._balancingMethod
    }

    updateItemWeight(target) {
        if (!target.enabled)
            return

        const i = this.findIndex(target)
        this.weights[ i ] = target.weight
        this.generateBalancer()
    }

    updateItemState(target) {
        if (target.enabled) {
            const i = this.findIndex(target, this.disabledItems)
            this.disabledItems.splice(i, 1)
            this.enabledItems.push(target)
            this.weights.push(target.weight)
        }
        else {
            let i = this.findIndex(target, this.enabledItems)
            this.weights.splice(i, 1)
            this.enabledItems.splice(i, 1)
            this.disabledItems.push(target)
        }

        this.generateBalancer()
    }

    add(target) {
        if (~this.findIndex(target))
            return

        target.list = this
        this.items.push(target)

        if (target.enabled) {
            this.weights.push(target.weight)
            this.enabledItems.push(target)
        }
        else
            this.disabledItems.push(target)

        this.generateBalancer()
    }

    addMany(targets) {
        for (let i = 0, l = targets.length; i < l; i++) {
            const target = targets[ i ]

            if (~this.findIndex(target))
                continue

            target.list = this
            this.items.push(target)

            if (target.enabled) {
                this.weights.push(target.weight)
                this.enabledItems.push(target)
            }
            else
                this.disabledItems.push(target)
        }

        this.generateBalancer()
    }

    findIndex(target, list) {
        const items = list || this.items

        for (let i = items.length; i--;)
            if (items[ i ] === target)
                return i

        return -1
    }

    findById(id, list) {
        const items = list || this.items

        for (let i = items.length; i--;) {
            const item = items[ i ]

            if (item.id === id)
                return item
        }

        return null
    }

    remove(target) {
        let i = this.findIndex(target)

        if (i === -1)
            return

        target.list = null
        this.items.splice(i, 1)

        if (target.enabled) {
            this.weights.splice(i, 1)
            i = this.findIndex(target, this.enabledItems)
            this.enabledItems.splice(i, 1)
        }
        else {
            i = this.findIndex(target, this.disabledItems)
            this.disabledItems.splice(i, 1)
        }

        this.generateBalancer()
    }

    removeById(id) {
        this.remove(this.findById(id))
    }

    clear() {
        const items = this.items

        for (let i = items.length; i--;)
            items[ i ].list = null

        this.items.length = 0
        this.weights.length = 0
        this.enabledItems.length = 0
        this.disabledItems.length = 0
    }

    generateBalancer() {
        if (!this.enabledItems.length)
            return

        switch (this._balancingMethod) {
            case TargetList.balancingMethod.roundRobin:
                this._balancer = roundRobin(this.weights)
                break

            case TargetList.balancingMethod.random:
                this._balancer = random(this.weights)
                break

            case TargetList.balancingMethod.urlHash:
                this._balancer = urlHash(this.enabledItems.length)
                break

            case TargetList.balancingMethod.sourceIpHash:
                this._balancer = sourceIpHash(this.enabledItems.length)
                break
        }
    }

    pick(req) {
        if (!this.enabledItems.length)
            return null
        else if (this.enabledItems.length === 1)
            return this.enabledItems[ 0 ]
        else
            return this.enabledItems[ this._balancer(req) ]
    }
}

TargetList.balancingMethod = Object.freeze({
    random: { name: 'random' },
    urlHash: { name: 'urlHash' },
    roundRobin: { name: 'roundRobin' },
    sourceIpHash: { name: 'sourceIpHash' }
})

module.exports = TargetList
