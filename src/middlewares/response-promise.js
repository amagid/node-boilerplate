const Promise = require('bluebird');
const logger = require('../services/logger');

module.exports = attachResponsePromise;

function attachResponsePromise(req, res, next) {
    res.promise = response => {
        return Promise.resolve(response)
            .then(result => {
                res.status(200).json(result);
            })
            .catch(error => {
                logger.warn(error);
                res.status(error.status || error.statusCode || 500).json(error.message || 'Unknown Error');
            })
            .catch(error => {
                logger.error(error);
                res.status(500, 'Unknown Error');
            });
    };
    next();
}