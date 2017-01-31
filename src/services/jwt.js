const jwt = require('jsonwebtoken');
const config = require('../../config');
const key = config.getKeys().privateKey;
const options = config.get().jwt;

function sign(data) {
    return jwt.sign(data, key, options);
}

function verify(token) {
    return jwt.verify(token, key);
}

module.exports = {
    sign,
    verify
};