'use strict';
const dev = require('./development');
const prod = require('./production');
const keys = require('./keys');

/**
 * Gets the current configuration
 * 
 * @return {Object} The current configuration.
 */
function get() {
    if (process.env.type === 'development') {
        return dev;
    } else if (process.env.type === 'production') {
        return prod;
    } else {
        return dev;
    }
}

module.exports = {
    get,
    getKeys: keys.getKeys
};