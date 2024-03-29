var React = require('react-native');
var Buffer = require('buffer').Buffer;
var $jwtConfig = require('./jwt-config');

var {
    AsyncStorage
    } = React;

var $jwtHelper = {
    urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: { throw 'Illegal base64url string!'; }
        }
        return new Buffer(output, 'base64').toString('ascii')
    },

    decodeToken(token) {
        var parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        var decoded = this.urlBase64Decode(parts[1]);

        if (!decoded) {
            throw new Error('Cannot decode the token');
        }

        return JSON.parse(decoded);
    },

    getTokenExpirationDate(token) {
        var decoded;
        decoded = this.decodeToken(token);

        if (!decoded.exp) {
            return null;
        }

        var d = new Date(0);
        d.setUTCSeconds(decoded.exp);

        return d;
    },

    isTokenExpired (token) {
        var d = this.getTokenExpirationDate(token);

        if (!d) {
            return false;
        }

        return !(d.valueOf() > new Date().valueOf());
    },

    clearToken() {
        return AsyncStorage.removeItem($jwtConfig.storageTokenPrefix);
    },

    setToken(token) {
        return AsyncStorage.setItem($jwtConfig.storageTokenPrefix, token);
    },

    getToken() {
        return AsyncStorage.getItem($jwtConfig.storageTokenPrefix);
    },

    isAuthenticated() {
        return new Promise((resolve, reject) => {
            this.getToken()
                .then((token) => {
                    if (token && !this.isTokenExpired(token)) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
        })
    }
};

module.exports = $jwtHelper;