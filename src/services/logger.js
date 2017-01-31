const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const normalTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/log'),
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    handleExceptions: true,
    humanReadableUnhandledException: true
});

const exceptionTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../logs/exceptions/exceptions'),
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    handleExceptions: true,
    humanReadableUnhandledException: true
});

const logger = new(winston.Logger)({
    transports: [
        normalTransport,
        new (winston.transports.Console)()
    ],
    exceptionHandlers: [
        normalTransport,
        new (winston.transports.Console)(),
        exceptionTransport
    ],
    exitOnError: false
});

module.exports = logger;