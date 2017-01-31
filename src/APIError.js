'use strict';
module.exports = (status, message) => { return new APIError(status, message) };

class APIError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}