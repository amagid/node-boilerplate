const Promise = require('bluebird');
const APIError = require('../../APIError');

module.exports = {
    login
};

function login(email, password) {
    return Promise.resolve(true).then(result => {
        throw APIError(400, 'Bad Request');
    });
}