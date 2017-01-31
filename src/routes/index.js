const express = require('express');
const mountAPI = require('./api');
const mountAuth = require('./auth');

module.exports = addRoutes;

function addRoutes(router) {
    const api = express.Router(),
        auth = express.Router();
    mountAPI(api);
    mountAuth(auth);
    
    router.use('/api', api);
    router.use('/auth', auth);
};