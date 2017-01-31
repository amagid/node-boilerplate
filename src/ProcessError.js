'use strict';
module.exports = (status, stage, message) => { return new ProcessError(status, stage, message) };

class ProcessError extends Error {
    constructor(status, stage, message) {
        super();
        this.status = status;
        this.stage = stage;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}