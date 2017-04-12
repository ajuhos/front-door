'use strict'

module.exports = Rule

const assert = require('assert'),
      isFormatted = /{([0-9]+)}/

function Rule(pattern, target) {
    assert(pattern instanceof RegExp, 'pattern must be a RegExp instance')

    this.target = target
    this.pattern = pattern
    this.formatted = isFormatted.test(target)
}

Rule.prototype.match = function match(url) {
    if (this.formatted) {
        const args = url.match(this.pattern)

        if (!args)
            return

        return format(this.target, args.slice(1))
    }
    else if(this.pattern.test(url))
        return this.target
}

Rule.fromPattern = function fromString(pattern, target) {
    let i = 0

    if (!target)
        target = pattern.replace(/\?|\*/g, () => `{${i++}}`)

    pattern = '^' +
        pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '(.+)')
            .replace(/\?/g, '(.*)')
             + '$'

    return new Rule(new RegExp(pattern, 'i'), target)
}

function format(str, args) {
    return str.replace(/{([0-9]+)}/g, (_, i) => args[ i ] || '')
}
