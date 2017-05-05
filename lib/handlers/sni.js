'use strict'

module.exports = selectCertificate

function selectCertificate(servername, rules) {
    for (let i = 0, l = rules.length; i < l; i++) {
        const rule = rules[ i ]

        if (rule.tlsSecureContext && rule.test(servername))
            return rule.tlsSecureContext
    }
}
