'use strict';
const fs = require('fs');
const path = require('path');

function getKeys() {
    const privateKey = fs.readFileSync(path.join(__dirname, 'jwt-private.key'))
    const publicKey = fs.readFileSync(path.join(__dirname, 'jwt-public.key'));
    return {
        privateKey,
        publicKey
    };
}

module.exports = {
    getKeys
};