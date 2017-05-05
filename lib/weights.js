'use strict'

module.exports = calculateWeights

function calculateWeights(scores) {
    const r = []
    let   s = 0

    for (let i = scores.length; i--;)
        s += scores[ i ]

    const p = 1000 / s

    for (let i = scores.length; i--;)
        r[ i ] = 1000 - Math.round(scores[ i ] * p)

    return r
}
